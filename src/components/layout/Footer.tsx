import { useTerminalStore } from "@/store/terminalStore";

const FOOTER_LINKS = [
  { href: "https://linkedin.com/in/vinayakparoononkooloth", label: "LinkedIn" },
  { href: "https://github.com/viinayakpk", label: "GitHub" },
  { href: "mailto:vinayakparoononkooloth@gmail.com", label: "Email" },
  { href: "/llms.txt", label: "llms.txt" },
];

export default function Footer() {
  const openTerminal = useTerminalStore((state) => state.open);

  return (
    <footer className="flex justify-center px-4 pb-10 pt-16" aria-label="Site footer">
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-glass)] px-2 py-2 text-sm backdrop-blur-xl">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            className="rounded-full px-4 py-2 text-text-muted transition-colors hover:text-text"
          >
            {link.label}
          </a>
        ))}
        <button
          type="button"
          onClick={openTerminal}
          className="rounded-full px-4 py-2 font-mono text-text-muted transition-colors hover:text-text"
          title="Open the agent terminal (Ctrl+J)"
        >
          Terminal
        </button>
      </div>
    </footer>
  );
}
