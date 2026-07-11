import { STACK_ICONS } from "@/data/stackIcons";
import StackIconGlyph from "@/components/common/StackIconGlyph";
import styles from "./Marquee.module.css";

const ROW_A = STACK_ICONS;
const ROW_B = [...STACK_ICONS].reverse();

function Row({ icons, reverse }: { icons: typeof STACK_ICONS; reverse?: boolean }) {
  const doubled = [...icons, ...icons];
  return (
    <div className="overflow-hidden">
      <div className={`${styles.track} ${reverse ? styles.trackReverse : ""}`}>
        {doubled.map((icon, i) => (
          <div
            key={`${icon.id}-${i}`}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-text-muted"
            title={icon.label}
          >
            <StackIconGlyph icon={icon} className="size-5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 text-center">
      <p className="text-2xl">
        <span className="font-semibold text-accent">5</span>{" "}
        <span className="font-semibold">production AI systems shipped</span>
      </p>
      <div className="mt-8 flex flex-col gap-4">
        <Row icons={ROW_A} />
        <Row icons={ROW_B} reverse />
      </div>
    </section>
  );
}
