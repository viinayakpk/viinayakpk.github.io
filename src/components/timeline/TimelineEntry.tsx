import type { ExperienceEntry } from "@/data/experience";
import { useScrollStore } from "@/store/scrollStore";

interface TimelineEntryProps {
  entry: ExperienceEntry;
  index: number;
}

export default function TimelineEntry({ entry, index }: TimelineEntryProps) {
  const isActive = useScrollStore((state) => state.activeIndex === index);

  return (
    <div
      className={`relative border-l pl-8 transition-opacity duration-300 ${
        isActive ? "border-accent opacity-100" : "border-[var(--border)] opacity-60"
      }`}
    >
      <span
        className={`absolute -left-[5px] top-1.5 size-2.5 rounded-full transition-colors ${
          isActive ? "bg-accent" : "bg-text-muted/50"
        }`}
      />
      <p className="font-mono text-xs uppercase tracking-wide text-text-muted">{entry.dates}</p>
      <h3 className="mt-1 text-lg font-medium">
        {entry.role} <span className="text-accent">@ {entry.company}</span>
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {entry.bullets.map((bullet, i) => (
          <li key={i} className="flex gap-2 text-sm text-text-muted">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-text-muted/60" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
