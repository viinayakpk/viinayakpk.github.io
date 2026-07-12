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
            className="grid size-16 shrink-0 place-items-center rounded-2xl"
            style={{ background: icon.bg, color: icon.fg }}
            title={icon.label}
          >
            <StackIconGlyph icon={icon} className="size-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 text-center">
      <div className="flex flex-col gap-4">
        <Row icons={ROW_A} />
        <Row icons={ROW_B} reverse />
      </div>
    </section>
  );
}
