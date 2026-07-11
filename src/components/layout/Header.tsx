import ThemeToggle from "../theme/ThemeToggle";
import GestureToggle from "../gesture/GestureToggle";

const NAV_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#stack", label: "Stack" },
];

export default function Header() {
  return (
    <header
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      aria-label="Site header"
    >
      <div className="flex w-full max-w-3xl items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-glass)] px-3 py-2 shadow-lg shadow-black/10 backdrop-blur-xl">
        <a
          href="#top"
          className="flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-sm font-medium text-text"
        >
          <span className="grid size-7 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-accent/15 font-semibold text-[10px] text-accent">
            VK
          </span>
          <span className="hidden font-semibold tracking-tight sm:inline">Vinayak Paroonon Kooloth</span>
          <span className="sm:hidden">Vinayak</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <GestureToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
