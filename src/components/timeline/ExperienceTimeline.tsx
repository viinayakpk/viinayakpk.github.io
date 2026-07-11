import { EXPERIENCE } from "@/data/experience";

export default function ExperienceTimeline() {
  return (
    <section id="work" className="mx-auto max-w-3xl px-6 py-20" aria-labelledby="work-title">
      <div className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Work experience</p>
        <h2 id="work-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
          Systems that shipped.
        </h2>
      </div>

      <ol className="flex flex-col gap-10 border-l border-[var(--border)] pl-8">
        {EXPERIENCE.map((entry) => (
          <li key={entry.id} className="relative">
            <span className="absolute -left-[calc(2rem+5px)] top-1.5 size-2.5 rounded-full bg-accent" />
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
          </li>
        ))}
      </ol>
    </section>
  );
}
