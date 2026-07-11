import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGestureController } from "./useGestureController";

function useShouldOfferGestureControl(): boolean {
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const hasCamera = "mediaDevices" in navigator && typeof navigator.mediaDevices?.getUserMedia === "function";
    const hasWasm = typeof WebAssembly !== "undefined";
    setEligible(finePointer && hasCamera && hasWasm);
  }, []);

  return eligible;
}

const STATUS_COPY: Record<string, string> = {
  loading: "Starting camera...",
  active: "Gesture control on - open palm to scroll, pinch to jump sections.",
  denied: "Camera access denied - gesture control unavailable.",
  unavailable: "Gesture control isn't supported in this browser.",
};

export default function GestureToggle() {
  const eligible = useShouldOfferGestureControl();
  const { status, gesture, start, stop } = useGestureController();
  const isOn = status === "active" || status === "loading";

  if (!eligible) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => (isOn ? stop() : start())}
        aria-pressed={isOn}
        aria-label={isOn ? "Turn off webcam gesture control" : "Turn on webcam gesture control"}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-glass)] text-text backdrop-blur transition-colors hover:border-accent/60"
      >
        {isOn ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 8l5-3v14l-5-3M3 6h9a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 8l5-3v14l-5-3M3 6h9a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2Z M2 2l20 20"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {status !== "idle" &&
        createPortal(
          <div
            role="status"
            className="fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl border border-[var(--border)] bg-[var(--surface-glass)] px-4 py-3 text-sm text-text backdrop-blur-xl"
          >
            <p>{STATUS_COPY[status]}</p>
            {status === "active" && (
              <p className="mt-1 font-mono text-xs text-accent">
                {gesture === "palm"
                  ? "Palm detected - scrolling"
                  : gesture === "pinch"
                    ? "Pinch detected - jumping"
                    : "No hand detected"}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
