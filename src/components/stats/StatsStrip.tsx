import { useCyclingIndex } from "@/components/hero/useCyclingIndex";
import { STATS } from "@/data/stats";

export default function StatsStrip() {
  const index = useCyclingIndex(STATS.length, 3400);
  const current = STATS[index];

  return (
    <section className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h2 className="text-lg font-semibold">Some Of My Interesting Stats</h2>
      <div key={current.id} className="mt-6 flex flex-col items-center gap-3 motion-safe:animate-[fadein_0.5s_ease]">
        <div className="grid size-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="1.6" />
            <path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" fill="var(--accent)" />
          </svg>
        </div>
        <p className="text-2xl font-semibold">
          <span className="text-accent">{current.value}</span> {current.label}
        </p>
      </div>
    </section>
  );
}
