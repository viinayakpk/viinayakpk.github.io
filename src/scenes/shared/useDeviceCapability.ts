import { useEffect, useState } from "react";

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function computeCapable(): boolean {
  if (typeof window === "undefined") return true;
  const nav = navigator as NavigatorWithMemory;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowCores = (nav.hardwareConcurrency ?? 8) <= 2;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
  const smallViewport = window.innerWidth < 640;

  if (lowMemory || (coarsePointer && (lowCores || smallViewport))) return false;
  return true;
}

/** Coarse heuristic gate for whether this device should attempt heavy WebGL scenes at all. */
export function useDeviceCapability(): boolean {
  const [capable, setCapable] = useState(computeCapable);

  useEffect(() => {
    setCapable(computeCapable());
  }, []);

  return capable;
}
