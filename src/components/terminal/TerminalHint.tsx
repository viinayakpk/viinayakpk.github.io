import { useEffect, useState } from "react";

export default function TerminalHint() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (sessionStorage.getItem("terminal-hint-seen")) return;
    const showTimer = window.setTimeout(() => setVisible(true), 4000);
    const hideTimer = window.setTimeout(() => setVisible(false), 12000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("terminal-hint-seen", "1");
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-glass)] px-4 py-3 text-sm text-text backdrop-blur-xl">
      <p>
        Just for fun, try pressing <span className="font-mono text-accent">Ctrl + J</span>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss hint"
        className="text-text-muted hover:text-text"
      >
        ×
      </button>
    </div>
  );
}
