import { useEffect, useState } from "react";

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/**
 * Should this device attempt the WebGL scene at all?
 *
 * This gate used to return `false` for ANY coarse pointer on a viewport under 640px —
 * i.e. it silently disabled the 3D on **every phone in existence**. That was defensible
 * when the hero was a decorative sphere. It is not defensible now: the hero IS the
 * argument, it is meant to be grabbed with a thumb, and shipping phone visitors a
 * static poster of a machine they are being invited to play with is worse than shipping
 * them nothing.
 *
 * So the test is no longer "is this a phone" — phones are the primary audience for a
 * portfolio a recruiter opens on the train. The test is "is this device actually
 * incapable, or has the user asked us not to."
 *
 * Cost is affordable on purpose: the escapement carries no physics engine, no
 * post-processing, no textures and no model files — it is a few thousand triangles of
 * generated geometry lit by a baked-once environment. DPR is capped and
 * PerformanceMonitor degrades it further if the device struggles. There is very little
 * left for a mid-range phone to choke on.
 */
function computeCapable(): boolean {
  if (typeof window === "undefined") return true;
  const nav = navigator as NavigatorWithMemory;

  // Respect Data Saver. Someone on a metered connection did not ask for a 3D hero.
  if (nav.connection?.saveData) return false;

  // Genuinely weak hardware, regardless of form factor. `deviceMemory` is coarse
  // (Chromium-only, rounded down to a power of two), so ≤1GB is a real signal and not
  // just a proxy for "phone" — plenty of good phones report 4 or 8.
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 1) return false;
  if ((nav.hardwareConcurrency ?? 8) <= 2) return false;

  // Last resort: no WebGL at all (old browsers, blocklisted drivers, some locked-down
  // corporate machines). Cheaper to find out now than to mount a canvas that throws.
  try {
    const canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl2") && !canvas.getContext("webgl")) return false;
  } catch {
    return false;
  }

  return true;
}

/** Gate for whether this device should attempt the WebGL scene. */
export function useDeviceCapability(): boolean {
  const [capable, setCapable] = useState(computeCapable);

  useEffect(() => {
    setCapable(computeCapable());
  }, []);

  return capable;
}
