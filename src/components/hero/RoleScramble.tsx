import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/scenes/shared/useReducedMotion";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01{}<>/_";
const DURATION_MS = 650;

interface RoleScrambleProps {
  text: string;
}

export default function RoleScramble({ text }: RoleScrambleProps) {
  const [display, setDisplay] = useState(text);
  const reducedMotion = useReducedMotion();
  const frameRef = useRef<number>();
  const startRef = useRef<number>();

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(text);
      return;
    }

    startRef.current = undefined;

    const tick = (timestamp: number) => {
      if (startRef.current === undefined) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / DURATION_MS);
      const revealCount = Math.floor(progress * text.length);

      const next = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealCount) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");
      setDisplay(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, reducedMotion]);

  return (
    <span aria-hidden="true" className="font-mono">
      {display}
    </span>
  );
}
