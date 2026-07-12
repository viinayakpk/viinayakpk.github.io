import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";
import StudioEnvironment from "@/scenes/rig/StudioEnvironment";
import {
  makeArbor,
  makeBalanceRim,
  makeEscapeWheel,
  makeGear,
  makePalletFork,
  makeSpiral,
} from "./gearGeometry";
import {
  BARREL_RATIO,
  CENTRE_RATIO,
  createEscapement,
  stepEscapement,
  wind,
  type EscapementState,
} from "./useEscapement";

/* ---------------------------------------------------------------------------
 * Layout. Wheel centres are spaced at the sum of their pitch radii, so the teeth
 * actually mesh instead of merely appearing near one another. A machine whose gears
 * visibly do not touch is a diagram with a drop shadow, which is the exact failure
 * mode this hero exists to avoid.
 * ------------------------------------------------------------------------ */
const BARREL = { x: -2.0, y: 0, r: 1.35 };
const CENTRE = { x: 0.15, y: 0, r: 0.8 }; // 1.35 + 0.8 = 2.15 = the gap. Meshed.
const ESCAPE = { x: 1.35, y: 0.58, r: 0.55 };
const FORK_HOME = new THREE.Vector3(2.16, 0.2, 0);

/**
 * Where the fork goes when you take it out and let go.
 *
 * Letting it stay wherever it was dropped looked like a bug — it would come to rest
 * half-buried in the balance wheel. Parking it on a consistent spot, lifted slightly
 * toward the viewer, reads as a deliberate act instead: you removed the part and set
 * it down on the bench. It also keeps it obviously visible and obviously clickable,
 * which is how you find your way back.
 */
const FORK_PARK = new THREE.Vector3(3.15, 1.5, 0.35);
const BALANCE = { x: 2.3, y: -0.95, r: 0.78 };

/** How far the fork must be dragged from its seat before the machine loses regulation. */
const UNSEAT_DISTANCE = 0.5;

/**
 * The plane the movement lives in, in the machine's OWN local space.
 *
 * Pointer rays get transformed into that space by the inverse of the group's world
 * matrix and intersected here — pure math, no raycasting against geometry, so dragging
 * costs nothing per frame AND it keeps working no matter how the machine is scaled,
 * offset, or tilted. That last part matters: the movement is raked toward the viewer
 * (see TILT), and a naive world-space z=0 plane would have made the fork slide away
 * from the user's finger.
 */
const LOCAL_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

/**
 * The whole movement is raked slightly toward the camera.
 *
 * This is not styling — it is the difference between a machine and a diagram. Gears
 * lying dead flat against the lens are just discs: their extruded thickness is
 * invisible, every face takes the same light, and the studio rig has nothing to rake
 * across. Turn them a few degrees and you see the *edges*, the bevels catch the key
 * light, one wheel occludes the next, and the thing acquires a body.
 */
const TILT: [number, number, number] = [-0.17, 0.3, 0];

/**
 * The machine's real extent in world units, labels and gauge included. The scene
 * scales itself to fit this into whatever viewport it lands in, rather than trusting
 * a fixed camera distance — a phone in portrait is barely 6 units wide at this focal
 * length, and a 7-unit-wide movement would simply have its balance wheel cropped off.
 * The gears must always all be visible: a machine you can only see part of is not a
 * machine, it is a texture.
 */
const MACHINE_W = 7.6;
const MACHINE_H = 6.6;

/**
 * Nudges the movement's optical centre onto the frame's centre. The parts span roughly
 * x ∈ [-3.35, 3.1] and y ∈ [-2.05, 1.15] — that vertical asymmetry (the gauge hangs
 * below, nothing balances it above) is why Y is corrected far harder than X.
 */
const OFFSET_X = -0.05;
const OFFSET_Y = 0.42;

type DragMode = { kind: "wind"; lastAngle: number } | { kind: "fork"; offset: THREE.Vector3 };

export default function Escapement() {
  const state = useRef<EscapementState>(createEscapement());
  const drag = useRef<DragMode | null>(null);
  const hovered = useRef<"wind" | "fork" | null>(null);
  const [cursor, setCursor] = useState<boolean>(false);
  useCursor(cursor, "grab");

  // Where the fork currently wants to be. Lerped toward each frame.
  const forkTarget = useRef(FORK_HOME.clone());

  const barrelRef = useRef<THREE.Group>(null);
  const centreRef = useRef<THREE.Group>(null);
  const escapeRef = useRef<THREE.Group>(null);
  const forkRef = useRef<THREE.Group>(null);
  const balanceRef = useRef<THREE.Group>(null);
  const shakeRef = useRef<THREE.Group>(null);
  const gaugeRef = useRef<THREE.Mesh>(null);

  const statusRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const hit = useMemo(() => new THREE.Vector3(), []);
  const inverse = useMemo(() => new THREE.Matrix4(), []);
  const localRay = useMemo(() => new THREE.Ray(), []);
  const fitRef = useRef<THREE.Group>(null);

  /*
   * Fit-to-viewport. `viewport` is the visible world size at z = 0, so this is an
   * exact contain-fit, recomputed on resize. Capped at 1 — the machine is designed at
   * its true size and should never be blown up past it on a wide monitor, only shrunk
   * to fit a narrow one.
   */
  const { viewport } = useThree();
  const fit = Math.min(viewport.width / MACHINE_W, viewport.height / MACHINE_H, 1);

  /* ---------------- Geometry. Built once, disposed on unmount. ---------------- */
  const geo = useMemo(
    () => ({
      // Solid web, no piercings: a mainspring barrel is a closed DRUM that contains the
      // spring, which is exactly what lets us show the coil on its face. The first pass
      // pierced it and buried the spring inside the extrusion, so the two read as one
      // unresolved scribble.
      barrel: makeGear({ radius: BARREL.r, teeth: 36, toothDepth: 0.16, thickness: 0.18, bore: 0.14, spokes: 0 }),
      mainspring: makeSpiral(0.22, 1.02, 4.5, 0.05),
      centre: makeGear({ radius: CENTRE.r, teeth: 22, toothDepth: 0.14, thickness: 0.13, bore: 0.1, spokes: 5 }),
      escape: makeEscapeWheel({ radius: ESCAPE.r, teeth: 15, toothDepth: 0.16, thickness: 0.09, bore: 0.08 }),
      fork: makePalletFork(0.085),
      balanceRim: makeBalanceRim(BALANCE.r, 0.07),
      hairspring: makeSpiral(0.1, 0.56, 6, 0.018),
      arbor: makeArbor(0.055, 0.5),
    }),
    [],
  );

  useEffect(
    () => () => Object.values(geo).forEach((g) => g.dispose()),
    [geo],
  );

  /* ---------------- Materials ---------------- */
  const mat = useMemo(
    () => ({
      // Brass: high metalness means it has almost no colour of its own — what you see
      // is the studio rig reflected in it. That is what makes it read as metal rather
      // than as a yellow plastic shape.
      brass: new THREE.MeshPhysicalMaterial({
        color: "#c8a04e",
        metalness: 0.92,
        roughness: 0.27,
        envMapIntensity: 1.5,
      }),
      brassDark: new THREE.MeshPhysicalMaterial({
        color: "#a67c3d",
        metalness: 0.9,
        roughness: 0.36,
        envMapIntensity: 1.2,
      }),
      steel: new THREE.MeshPhysicalMaterial({
        color: "#c3cbd2",
        metalness: 1,
        roughness: 0.19,
        envMapIntensity: 1.6,
      }),
      // The fork is the ONE thing painted in the brand accent, and that is an
      // affordance, not decoration: the interactive part of the machine is the only
      // part wearing the brand colour, so "the orange thing comes out" is learnable
      // without a single word of instruction.
      accent: new THREE.MeshPhysicalMaterial({
        color: "#e8672e",
        metalness: 0.45,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.3,
      }),
    }),
    [],
  );

  useEffect(() => () => Object.values(mat).forEach((m) => m.dispose()), [mat]);

  /* ---------------- Pointer handling ----------------
   * Everything is driven from R3F pointer events on the meshes themselves, which
   * means the raycaster gates them: a touch that lands on empty canvas never starts a
   * drag, and the page scrolls normally. That, plus `touch-action: pan-y` on the
   * canvas, is the whole answer to the mobile scroll-conflict problem — the single
   * biggest trap in shipping a draggable hero on a scrolling page.
   *
   * Ray/plane intersection gives us an exact world point without raycasting geometry,
   * so it keeps working when the pointer travels outside the object mid-drag.
   */
  /**
   * World-space pointer ray → the machine's own local coordinates.
   *
   * Inverting the group's world matrix and transforming the ray into local space means
   * the scale (fit-to-viewport), the offset, and the tilt are all handled exactly and
   * automatically. Compared with hand-inverting each transform, this cannot drift out
   * of sync when the layout changes — and on a phone, drift means the fork crawls away
   * from the thumb that is trying to hold it.
   */
  const pointOnPlane = (e: ThreeEvent<PointerEvent>): THREE.Vector3 | null => {
    const g = fitRef.current;
    if (!g) return null;
    inverse.copy(g.matrixWorld).invert();
    localRay.copy(e.ray).applyMatrix4(inverse);
    return localRay.intersectPlane(LOCAL_PLANE, hit) ? hit : null;
  };

  const beginWind = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const p = pointOnPlane(e);
    if (!p) return;
    drag.current = { kind: "wind", lastAngle: Math.atan2(p.y - BARREL.y, p.x - BARREL.x) };
    setCursor(true);
  };

  const beginFork = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const p = pointOnPlane(e);
    if (!p) return;
    drag.current = { kind: "fork", offset: p.clone().sub(forkTarget.current) };
    setCursor(true);
  };

  const move = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    if (!d) return;
    const p = pointOnPlane(e);
    if (!p) return;

    if (d.kind === "wind") {
      const angle = Math.atan2(p.y - BARREL.y, p.x - BARREL.x);
      let delta = angle - d.lastAngle;
      // Unwrap across the ±π seam, or one drag past 180° would unwind everything.
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      d.lastAngle = angle;
      // Clockwise (negative delta) winds. Same gesture as a real crown.
      wind(state.current, -delta * 0.19);
    } else {
      forkTarget.current.copy(p).sub(d.offset);
      forkTarget.current.z = 0;
      // Keep it inside the frame, so it can never be flung somewhere unrecoverable.
      forkTarget.current.x = THREE.MathUtils.clamp(forkTarget.current.x, -0.4, 3.3);
      forkTarget.current.y = THREE.MathUtils.clamp(forkTarget.current.y, -1.9, 1.9);

      // Regulation is lost the moment the pallets leave the escape wheel — not on
      // release. You feel the machine break free while it is still in your hand.
      state.current.forkIn = forkTarget.current.distanceTo(FORK_HOME) < UNSEAT_DISTANCE;
    }
  };

  const end = (e: ThreeEvent<PointerEvent>) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    const d = drag.current;
    drag.current = null;
    setCursor(false);

    if (d?.kind === "fork") {
      if (forkTarget.current.distanceTo(FORK_HOME) < UNSEAT_DISTANCE * 1.8) {
        // Released near the seat: snap home and resume regulating. This is the reward —
        // the machine recovers, and the tick comes back.
        forkTarget.current.copy(FORK_HOME);
        state.current.forkIn = true;
      } else {
        // Released clear of the movement: set it down on the bench.
        forkTarget.current.copy(FORK_PARK);
        state.current.forkIn = false;
      }
    }
  };

  /** Tap the fork while it is out to put it straight back — a forgiving second path home. */
  const reseat = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (state.current.forkIn) return;
    forkTarget.current.copy(FORK_HOME);
    state.current.forkIn = true;
  };

  /* ---------------- The frame loop ----------------
   * Everything below is written straight to object transforms and to DOM style/text.
   * The simulation state never touches React, so a machine ticking at 2.5 Hz with a
   * spinning gear train costs exactly zero re-renders.
   */
  useFrame((frame, dt) => {
    const s = state.current;
    stepEscapement(s, dt, frame.clock.elapsedTime);

    if (escapeRef.current) escapeRef.current.rotation.z = s.escapeShown;
    if (centreRef.current) centreRef.current.rotation.z = s.escapeShown * CENTRE_RATIO;
    if (barrelRef.current) barrelRef.current.rotation.z = s.escapeShown * BARREL_RATIO;
    if (balanceRef.current) balanceRef.current.rotation.z = s.balance;

    if (forkRef.current) {
      // Follow the pointer while held; spring home when seated.
      forkRef.current.position.lerp(forkTarget.current, 1 - Math.exp(-18 * dt));
      forkRef.current.rotation.z = s.forkIn ? s.fork : s.fork + 0.5;
    }

    // The wind gauge: a bar that fills as the mainspring stores intent.
    if (gaugeRef.current) {
      gaugeRef.current.scale.x = Math.max(0.001, s.wind);
      const m = gaugeRef.current.material as THREE.MeshPhysicalMaterial;
      m.color.setHex(s.forkIn ? 0xe8672e : 0xd23b1f);
    }

    /*
     * The shudder. In runaway the whole movement rattles in its frame — this is the
     * one place the machine is allowed to look out of control, and it is doing real
     * work: it converts an abstract claim ("an unregulated agent burns its budget")
     * into something you feel in your wrist.
     *
     * It lives on an INNER group, deliberately. The outer group carries the
     * fit-to-viewport scale and offset that the pointer maths inverts; jittering that
     * transform would make the fork drift away from the user's finger exactly when
     * they are trying to put it back.
     */
    if (shakeRef.current) {
      const shake = s.panic * Math.min(1, s.vel * 0.04) * 0.09;
      shakeRef.current.position.x = (Math.random() - 0.5) * shake;
      shakeRef.current.position.y = (Math.random() - 0.5) * shake;
      shakeRef.current.rotation.z = (Math.random() - 0.5) * shake * 0.06;
    }

    // DOM readouts, written imperatively. No React state, no renders.
    if (statusRef.current) {
      const spent = s.wind <= 0 && s.vel < 0.05;

      /*
       * Four states, and the pair of them at the bottom is the whole point of the
       * hero. Both END with an empty mainspring — identical energy in, identical
       * energy gone. The difference is that the regulated machine spent it over a
       * minute of useful, measured ticks, and the unregulated one threw it all away in
       * about a second and achieved nothing. That is the argument, and you arrive at
       * it by playing rather than by reading a paragraph about evals.
       */
      let label: string;
      let detail: string;
      if (!s.forkIn && spent) {
        label = "SEIZED";
        detail = `budget gone in ${s.ticks} ticks · put the critic back`;
      } else if (!s.forkIn) {
        label = "RUNAWAY";
        detail = "no critic · burning the whole budget at once";
      } else if (spent) {
        label = "UNWOUND";
        detail = "no stored intent · drag the barrel to wind it";
      } else {
        label = "REGULATED";
        detail = `${s.ticks} ticks · 2.5 Hz · ${Math.round(s.wind * 100)}% wound`;
      }

      const next = `${label}||${detail}`;
      if (statusRef.current.dataset.v !== next) {
        statusRef.current.dataset.v = next;
        statusRef.current.innerHTML = `<b>${label}</b><span>${detail}</span>`;
        statusRef.current.className = `esc-status${s.forkIn ? "" : " esc-status--panic"}`;
      }
    }

    /*
     * The hint only ever speaks when the visitor is actually stuck, and it always names
     * the single next action. It appears when the machine is dead and needs winding,
     * and again when the critic is lying on the bench — the one state you cannot get
     * out of by waiting.
     */
    if (hintRef.current) {
      const needsWind = s.forkIn && s.wind < 0.04;
      const needsFork = !s.forkIn;
      const text = needsFork
        ? "Click the fork to put the critic back"
        : "Drag the barrel to wind it · then pull the orange fork out";

      if (hintRef.current.textContent !== text) hintRef.current.textContent = text;
      hintRef.current.style.opacity = needsWind || needsFork ? "1" : "0";
    }
  });

  return (
    <>
      <StudioEnvironment />

      {/*
        A single shadow-casting key, on top of the environment rig.

        An environment map lights beautifully but it CANNOT cast a shadow — it is a
        sphere of incoming light with no occlusion. That is why the first version of
        this scene read as flat vector art despite every mesh having `castShadow` set:
        there was nothing in the scene capable of casting one. One directional light
        and a backplate to catch it is what turns a pile of discs into a movement with
        real depth, and it is the cheapest possible way to buy that (one shadow pass).
      */}
      <directionalLight
        position={[-4, 6, 7]}
        intensity={1.5}
        color="#fff2e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0012}
      />

      {/* Outer group: fit-to-viewport scale, centring offset, and the rake. The pointer
          maths inverts this group's world matrix, so the transform can be anything —
          but the runaway shudder still lives on a separate inner group so that a
          jittering matrix never fights the finger holding the fork. */}
      <group ref={fitRef} position={[OFFSET_X * fit, OFFSET_Y * fit, 0]} scale={fit} rotation={TILT}>
        <group ref={shakeRef}>
        {/*
          The shadow catcher.

          A solid backplate was the obvious move here and it was wrong: it rendered as a
          visibly tilted cream slab with hard edges, so the movement stopped looking like
          a machine in the page and started looking like a photograph pasted onto a card.

          `shadowMaterial` fixes it exactly. The plane is completely invisible EXCEPT
          where a shadow lands on it — so the wheels throw their shadows straight onto
          the page's own background, and there is no card, no edge, and no seam. The
          machine gains depth without gaining a container.
        */}
        <mesh position={[0.1, -0.25, -0.62]} receiveShadow>
          <planeGeometry args={[26, 18]} />
          <shadowMaterial transparent opacity={0.3} color="#3a2a20" />
        </mesh>
        {/* ---------- PLANNER: the mainspring barrel. Drag it to wind. ---------- */}
        <group
          position={[BARREL.x, BARREL.y, 0]}
          onPointerDown={beginWind}
          onPointerMove={move}
          onPointerUp={end}
          onPointerOver={() => (hovered.current = "wind")}
          onPointerOut={() => (hovered.current = null)}
        >
          <group ref={barrelRef}>
            <mesh geometry={geo.barrel} material={mat.brass} castShadow receiveShadow />
            {/* In FRONT of the drum's face (thickness 0.18, so it spans ±0.09), not
                buried inside it. */}
            <mesh geometry={geo.mainspring} material={mat.steel} position={[0, 0, 0.11]} castShadow />
          </group>
          <mesh geometry={geo.arbor} material={mat.steel} castShadow />
          <Html center position={[0, -BARREL.r - 0.34, 0]} pointerEvents="none" zIndexRange={[8, 0]}>
            <div className="esc-label">
              <b>PLANNER</b>
              <span>mainspring · stored intent</span>
            </div>
          </Html>
        </group>

        {/* ---------- The gear train: intent becoming work. ---------- */}
        <group position={[CENTRE.x, CENTRE.y, 0]}>
          <group ref={centreRef}>
            <mesh geometry={geo.centre} material={mat.brassDark} castShadow receiveShadow />
          </group>
          <mesh geometry={geo.arbor} material={mat.steel} castShadow />
        </group>

        {/* ---------- CRITIC: the escape wheel. Ticks work out one tooth at a time. ---------- */}
        <group position={[ESCAPE.x, ESCAPE.y, 0]}>
          <group ref={escapeRef}>
            <mesh geometry={geo.escape} material={mat.brass} castShadow receiveShadow />
          </group>
          <mesh geometry={geo.arbor} material={mat.steel} castShadow />
          <Html center position={[0, ESCAPE.r + 0.42, 0]} pointerEvents="none" zIndexRange={[8, 0]}>
            <div className="esc-label">
              <b>CRITIC</b>
              <span>escape wheel · releases work in ticks</span>
            </div>
          </Html>
        </group>

        {/* ---------- The pallet fork. THE piece. Pull it out. ---------- */}
        <group
          ref={forkRef}
          position={FORK_HOME.toArray()}
          onPointerDown={beginFork}
          onPointerMove={move}
          onPointerUp={end}
          onClick={reseat}
          onPointerOver={() => (hovered.current = "fork")}
          onPointerOut={() => (hovered.current = null)}
        >
          <mesh geometry={geo.fork} material={mat.accent} castShadow receiveShadow />
          {/* Ruby pallets — the two jewels that actually catch the escape wheel's teeth. */}
          <mesh position={[0.46, 0.27, 0.06]} castShadow>
            <boxGeometry args={[0.07, 0.07, 0.05]} />
            <meshPhysicalMaterial color="#b8232a" metalness={0.2} roughness={0.1} clearcoat={1} />
          </mesh>
          <mesh position={[0.46, -0.31, 0.06]} castShadow>
            <boxGeometry args={[0.07, 0.07, 0.05]} />
            <meshPhysicalMaterial color="#b8232a" metalness={0.2} roughness={0.1} clearcoat={1} />
          </mesh>
        </group>

        {/* ---------- EVAL: the balance wheel. Keeps the rate honest. ---------- */}
        <group position={[BALANCE.x, BALANCE.y, 0]}>
          <group ref={balanceRef}>
            <mesh geometry={geo.balanceRim} material={mat.brass} castShadow receiveShadow />
            <mesh geometry={geo.hairspring} material={mat.steel} position={[0, 0, 0.1]} castShadow />
            {/* spokes */}
            {[0, Math.PI / 2].map((a) => (
              <mesh key={a} rotation={[0, 0, a]} castShadow>
                <boxGeometry args={[BALANCE.r * 2, 0.05, 0.05]} />
                <primitive object={mat.brassDark} attach="material" />
              </mesh>
            ))}
          </group>
          <mesh geometry={geo.arbor} material={mat.steel} castShadow />
          <Html center position={[0, -BALANCE.r - 0.34, 0]} pointerEvents="none" zIndexRange={[8, 0]}>
            <div className="esc-label">
              <b>EVAL</b>
              <span>balance wheel · keeps the rate honest</span>
            </div>
          </Html>
        </group>

        {/* ---------- The wind gauge ---------- */}
        <group position={[BARREL.x - 0.02, -2.05, 0]}>
          <mesh position={[0.75, 0, -0.02]}>
            <boxGeometry args={[1.5, 0.07, 0.02]} />
            <meshBasicMaterial color="#b8ada3" transparent opacity={0.25} />
          </mesh>
          {/* scale.x is driven from `wind`; the box is anchored left by its own offset. */}
          <mesh ref={gaugeRef} position={[0, 0, 0]}>
            <boxGeometry args={[1.5, 0.07, 0.04]} />
            <meshPhysicalMaterial color="#e8672e" metalness={0.3} roughness={0.4} />
          </mesh>
        </group>
        </group>
      </group>

      {/* Status readout + the hint. Both written imperatively from useFrame. */}
      <Html center position={[0, 2.55 * fit, 0]} pointerEvents="none" zIndexRange={[9, 0]}>
        <div ref={statusRef} className="esc-status">
          <b>UNWOUND</b>
          <span>no stored intent · wind the barrel</span>
        </div>
      </Html>

      <Html center position={[0, -2.85 * fit, 0]} pointerEvents="none" zIndexRange={[9, 0]}>
        <div ref={hintRef} className="esc-hint">
          Drag the barrel to wind it · then pull the orange fork out
        </div>
      </Html>

      {/*
        No <ContactShadows> here, deliberately. It drops a shadow onto a horizontal
        GROUND plane — right for an object resting on a table, wrong for a clock
        movement, whose wheels turn in a vertical plane and rest on nothing. The
        shadow catcher behind the machine is the correct read: light rakes across the
        movement and the wheels throw their shadows onto the wall behind them.
      */}
    </>
  );
}
