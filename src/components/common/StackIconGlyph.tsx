import type { StackIcon } from "@/data/stackIcons";

interface StackIconGlyphProps {
  icon: StackIcon;
  className?: string;
}

export default function StackIconGlyph({ icon, className }: StackIconGlyphProps) {
  if (icon.d) {
    return (
      <svg viewBox="0 0 24 24" className={className} role="img" aria-label={icon.label}>
        <path d={icon.d} fill="currentColor" />
      </svg>
    );
  }

  return (
    <span
      className={`grid place-items-center font-mono text-[0.6em] font-bold ${className ?? ""}`}
      role="img"
      aria-label={icon.label}
    >
      {icon.glyph}
    </span>
  );
}
