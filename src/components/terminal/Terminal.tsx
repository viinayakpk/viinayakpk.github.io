import { useEffect, useRef, useState } from "react";
import { useTerminalStore } from "@/store/terminalStore";
import { useReducedMotion } from "@/scenes/shared/useReducedMotion";
import { BOOT_LINES, type TerminalLine } from "./bootScript";
import styles from "./Terminal.module.css";

const LINE_COLOR: Record<NonNullable<TerminalLine["color"]>, string> = {
  codex: "#93c9ff",
  claude: "#ff9d5c",
  kimi: "#a78bfa",
  muted: "var(--text-muted)",
  accent: "var(--accent)",
};

export default function Terminal() {
  const isOpen = useTerminalStore((state) => state.isOpen);
  const close = useTerminalStore((state) => state.close);
  const reducedMotion = useReducedMotion();

  const [visibleCount, setVisibleCount] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Global Ctrl+J hotkey (desktop) - always listening, independent of open state.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        useTerminalStore.getState().toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setVisibleCount(0);
      return;
    }

    previouslyFocused.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();

    if (reducedMotion) {
      setVisibleCount(BOOT_LINES.length);
      return;
    }

    let cancelled = false;
    let i = 0;
    const revealNext = () => {
      if (cancelled) return;
      i += 1;
      setVisibleCount(i);
      if (i < BOOT_LINES.length) {
        window.setTimeout(revealNext, 90);
      }
    };
    revealNext();

    return () => {
      cancelled = true;
    };
  }, [isOpen, reducedMotion]);

  useEffect(() => {
    if (isOpen) return;
    previouslyFocused.current?.focus?.();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Agent OS terminal"
        tabIndex={-1}
        className={styles.window}
      >
        <div className={styles.titlebar}>
          <span className={styles.dot} style={{ background: "#ff6159" }} />
          <span className={styles.dot} style={{ background: "#ffbd2e" }} />
          <span className={styles.dot} style={{ background: "#27c93f" }} />
          <span className="ml-2 font-mono text-xs text-text-muted">agent-os — zsh</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close terminal"
            className="ml-auto rounded px-2 text-xs text-text-muted hover:text-text"
          >
            esc
          </button>
        </div>
        <div className={styles.body}>
          {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
            <p key={i} style={{ color: line.color ? LINE_COLOR[line.color] : "var(--text)" }}>
              {line.prefix && <span className="text-text-muted">{line.prefix}  </span>}
              {line.text || " "}
            </p>
          ))}
          {visibleCount >= BOOT_LINES.length && <span className={styles.cursor} aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
