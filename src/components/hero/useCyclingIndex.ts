import { useEffect, useState } from "react";
import { useReducedMotion } from "@/scenes/shared/useReducedMotion";

export function useCyclingIndex(length: number, intervalMs: number) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs, reducedMotion]);

  return index;
}
