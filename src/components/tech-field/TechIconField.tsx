import { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { STACK_ICONS } from "@/data/stackIcons";
import StackIconGlyph from "@/components/common/StackIconGlyph";
import { scatterPoints } from "./scatterLayout";

export default function TechIconField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const points = useMemo(() => scatterPoints(STACK_ICONS.length), []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".tech-icon", {
          opacity: 0,
          scale: 0.4,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: { each: 0.045, from: "random" },
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            once: true,
          },
        });
      });

      return () => mm.revert();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="stack"
      ref={containerRef}
      className="relative mx-auto h-[420px] max-w-5xl px-6"
      aria-labelledby="stack-title"
    >
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="tiny-label font-mono text-xs uppercase tracking-[0.3em] text-accent">Working stack</p>
        <h2 id="stack-title" className="mt-2 max-w-md text-2xl font-semibold sm:text-3xl">
          The tools behind the claims.
        </h2>
      </div>

      {STACK_ICONS.map((icon, i) => {
        const point = points[i];
        if (!point) return null;
        return (
          <div
            key={icon.id}
            className="tech-icon absolute grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-text-muted shadow-sm transition-colors hover:text-accent"
            style={{
              left: `${point.xPct}%`,
              top: `${point.yPct}%`,
              transform: `translate(-50%, -50%) scale(${point.scale})`,
            }}
            title={icon.label}
          >
            <StackIconGlyph icon={icon} className="size-6" />
          </div>
        );
      })}
    </section>
  );
}
