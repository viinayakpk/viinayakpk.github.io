import * as THREE from "three";

/**
 * The escapement's simulation. Hand-written kinematics — NOT a physics engine.
 *
 * This is a deliberate engineering decision, and it is worth stating plainly because
 * the reflex is to reach for Rapier the moment anything is "draggable". Rapier costs
 * **753 KB gzipped** (its 1.4 MB WASM is base64-inlined into the JS, so it cannot
 * even stream-compile) — nearly three times the entire rest of the 3D stack, and
 * roughly four seconds of download on a throttled mobile connection.
 *
 * And it would buy us nothing. A rigid-body solver exists to compute *unpredictable*
 * outcomes: arbitrary bodies colliding in ways nobody enumerated. A clock is the
 * exact opposite of unpredictable. Every relationship in it is a fixed ratio, known
 * in advance, by design — that is what a machine IS. The gear train is a
 * multiplication. The escapement is a state machine. The balance is a sine wave.
 *
 * So the whole thing is ~80 lines of trigonometry, costs 0 KB, runs identically on a
 * phone and a workstation, and is fully deterministic. The physics engine would have
 * been 753 KB of general-purpose machinery to compute an answer we already know.
 */

/** Teeth on the escape wheel. One tooth escapes per beat — this sets the whole timing. */
export const ESCAPE_TEETH = 15;
const TOOTH_ANGLE = (Math.PI * 2) / ESCAPE_TEETH;

/** Beats per second while regulated. ~2.5 Hz is a real, pleasant clock tick. */
const BEAT_HZ = 2.5;

/** Energy drawn from the mainspring per escaped tooth. Full wind ≈ 170 ticks ≈ 68s. */
const DRAIN_PER_TICK = 0.0058;

/**
 * Runaway angular velocity per unit of remaining wind (rad/s at full wind).
 * This is what "an agent with no critic" looks like: the stored intent converts to
 * motion as fast as the gear train can pass it, with nothing metering the rate.
 */
const RUNAWAY_GAIN = 46;
/** Energy burned per radian of unregulated spin. */
const RUNAWAY_BURN = 0.021;

/**
 * Constant friction during a runaway, and it is NOT a detail — without it the machine
 * never actually stops.
 *
 * Burn proportional to velocity, with velocity proportional to remaining wind, makes
 * `dw/dt = -k·w` — pure exponential decay. It asymptotes toward empty and never arrives:
 * the first build was still reading RUNAWAY several seconds later, with a few percent
 * of spring left, spinning slowly and forever. Ridiculous, and it robbed the moment of
 * its ending.
 *
 * A constant term guarantees the spring reaches exactly zero in bounded time (~1.5s),
 * so the wheel screams, slows, and SEIZES. The stop is the punchline; it has to land.
 */
const RUNAWAY_FRICTION = 0.34;

/** Gear ratios. The barrel turns slowly; the escape wheel turns fast. As in a real movement. */
export const CENTRE_RATIO = -1 / 6;
export const BARREL_RATIO = -1 / 26;

export interface EscapementState {
  /** 0 = dead, 1 = fully wound. The mainspring. The PLANNER's stored intent. */
  wind: number;
  /** Is the pallet fork seated? The CRITIC. Pull it and regulation is gone. */
  forkIn: boolean;

  /** Escape-wheel rotation. Advances one TOOTH_ANGLE per beat when regulated. */
  escape: number;
  /** Eased follower — the wheel SNAPS to `escape`, it does not glide. See stepEscapement. */
  escapeShown: number;
  /** Balance-wheel angle (radians). The EVAL: oscillates, keeps the rate honest. */
  balance: number;
  /** Pallet-fork rocking angle, driven by the balance while seated. */
  fork: number;

  /** Runaway angular velocity. Zero whenever the fork is in. */
  vel: number;
  /** Fractional beats elapsed. Its integer part crossing is what fires a tick. */
  beat: number;
  /** Integer ticks escaped. Drives the counter in the UI. */
  ticks: number;
  /** 1 on the frame a tooth escapes, decaying — used to flash/knock the wheel. */
  tickFlash: number;
  /** Rises while the machine is tearing itself apart. Drives the shudder + warning. */
  panic: number;
}

export function createEscapement(): EscapementState {
  return {
    wind: 0,
    forkIn: true,
    escape: 0,
    escapeShown: 0,
    balance: 0,
    fork: 0,
    vel: 0,
    beat: 0,
    ticks: 0,
    tickFlash: 0,
    panic: 0,
  };
}

/**
 * Advance the machine one frame.
 *
 * Two regimes, and the entire argument of the hero lives in the difference:
 *
 *   REGULATED (fork seated). Energy leaves the mainspring in discrete, equal
 *   quanta — one tooth per beat — at a rate set by the balance wheel and NOT by how
 *   much force is left in the spring. That is the miracle of an escapement: a wildly
 *   varying input torque produces a perfectly constant output rate. A fully-wound
 *   clock does not run fast. This is what a critic/eval loop does to an agent.
 *
 *   RUNAWAY (fork pulled). Nothing meters anything. Velocity is now simply
 *   proportional to remaining torque, so the spring dumps everything it has as fast
 *   as the train will physically turn, and the machine spins itself to a stop in
 *   about a second. Same energy. No regulation. Total loss.
 */
export function stepEscapement(s: EscapementState, dt: number, elapsed: number): void {
  // Clamp dt: a background tab or a GC pause must never let the sim explode.
  const step = Math.min(dt, 1 / 30);

  s.tickFlash = Math.max(0, s.tickFlash - step * 6);

  if (s.forkIn) {
    s.vel = 0;
    s.panic = Math.max(0, s.panic - step * 2.4);

    if (s.wind > 0) {
      // The balance swings at a fixed frequency. Amplitude falls as the spring
      // unwinds — a real horological behaviour, and a free legibility win: you can
      // see the machine getting tired.
      s.beat += BEAT_HZ * step;
      const amplitude = 0.55 + 0.75 * s.wind;
      s.balance = Math.sin(s.beat * Math.PI) * amplitude;

      // The fork rocks with the balance, but squared off — it slams between two
      // seats rather than gliding, because that is what locks and releases a tooth.
      s.fork = Math.tanh(Math.sin(s.beat * Math.PI) * 3.2) * 0.17;

      // Has a tooth escaped? Integer part of `beat` crossing = one tooth released.
      const due = Math.floor(s.beat);
      if (due > s.ticks) {
        const escaped = due - s.ticks;
        s.ticks = due;
        s.escape += TOOTH_ANGLE * escaped;
        s.wind = Math.max(0, s.wind - DRAIN_PER_TICK * escaped);
        s.tickFlash = 1;
      }
    } else {
      // Dead. The balance coasts to rest; nothing else moves.
      s.balance *= Math.exp(-2.5 * step);
      s.fork *= Math.exp(-3 * step);
    }

    /*
     * The escape wheel SNAPS to its target angle — it must never glide. A smooth
     * lerp here would silently destroy the whole illusion: a continuously-rotating
     * wheel is just a gear, and the thing that makes an escapement legible as a
     * *regulator* is precisely that it moves in visible, discrete jumps. Stiff
     * critical damping gives the snap plus a hint of settle, which reads as a tick.
     */
    const snap = 1 - Math.exp(-26 * step);
    s.escapeShown += (s.escape - s.escapeShown) * snap;
  } else {
    // RUNAWAY. Torque-driven, unmetered.
    s.panic = Math.min(1, s.panic + step * 3);
    s.vel = RUNAWAY_GAIN * s.wind + s.vel * 0.02;
    s.escape += s.vel * step;
    s.wind = Math.max(0, s.wind - (RUNAWAY_BURN * s.vel + RUNAWAY_FRICTION) * step);

    // Empty. Whatever momentum is left bleeds off into the bearings, and it stops.
    if (s.wind <= 0) {
      s.wind = 0;
      s.vel *= Math.exp(-7 * step);
      if (s.vel < 0.02) s.vel = 0;
    }

    // No impulses reach the balance any more, so it just spins down, uselessly.
    s.balance += s.vel * 0.12 * step;
    s.balance *= Math.exp(-1.1 * step);
    // The fork, unseated, flutters.
    s.fork = Math.sin(elapsed * 34) * 0.05 * Math.min(1, s.vel * 0.06);

    // In runaway there is nothing to snap to — the wheel is simply spinning.
    s.escapeShown = s.escape;

    // Keep the beat counter coherent with the wheel so re-seating the fork resumes
    // cleanly instead of teleporting the wheel back.
    s.beat = s.escape / TOOTH_ANGLE;
    s.ticks = Math.floor(s.beat);
  }
}

/** Wind the mainspring. Called from the drag handler; clamped, so it cannot be over-wound. */
export function wind(s: EscapementState, amount: number): void {
  s.wind = THREE.MathUtils.clamp(s.wind + amount, 0, 1);
}
