import { List } from "@phosphor-icons/react";
import ThemeToggle from "../theme/ThemeToggle";
import GestureToggle from "../gesture/GestureToggle";

const NAV_LINKS = [
  { href: "#agent", label: "Agent." },
  { href: "#work", label: "Work." },
  { href: "https://linkedin.com/in/vinayakparoononkooloth", label: "LinkedIn." },
  { href: "https://github.com/viinayakpk", label: "Github." },
];

export default function Header() {
  return (
    <header
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      aria-label="Site header"
    >
      <div className="flex items-center gap-3 rounded-[var(--radius-full)] border border-[var(--border)] bg-[var(--surface-glass)] px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl">
        <a href="#top" className="flex items-center gap-2 text-sm font-semibold text-text">
          <List size={16} weight="bold" aria-hidden="true" />
          Vinayak.
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="fixed right-4 top-4 flex items-center gap-2">
        <GestureToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
