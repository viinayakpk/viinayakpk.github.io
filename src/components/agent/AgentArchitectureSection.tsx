import { useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import PipelineDiagram from "./PipelineDiagram";
import { PIPELINE_STAGES } from "@/data/agentPipeline";

/**
 * The architecture section.
 *
 * This used to mount a WebGL canvas rendering the pipeline as a 3D graph, with a
 * scroll-driven camera trucking between nodes. It was cut, deliberately.
 *
 * The 3D version had a fatal information-design problem, not a rendering one: the
 * graph spans seven columns over ~23 world units, and at any camera distance that
 * made the labels legible you could only see two or three nodes. So the single thing
 * the section exists to communicate — the *shape* of the architecture, that it is
 * intent-routed, parallel, grounded, and looped back on itself — was the one thing
 * the 3D could never show you. The SVG shows all of it, at once, in crisp text, for
 * zero GPU.
 *
 * What survives from that version is the part that was actually good: the scroll
 * narrative. Each beat below is a scroll trigger, and the playhead drives the
 * diagram, so the architecture still assembles itself as you read.
 */
export default function AgentArchitectureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const narrativeRef = useRef<HTMLOListElement>(null);

  const [activeStage, setActiveStage] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const count = PIPELINE_STAGES.length;

      // Scrub the narrative playhead across the stages. This is now the ONLY thing
      // scroll drives here, and it only ever sets an integer — so the whole section
      // costs seven React renders across its entire scroll, not one per frame.
      const trigger = ScrollTrigger.create({
        trigger: narrativeRef.current,
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => {
          const index = Math.min(count - 1, Math.max(0, Math.floor(self.progress * count)));
          setActiveStage((prev) => (prev === index ? prev : index));
        },
      });

      return () => trigger.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="agent"
      ref={sectionRef}
      className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-16"
      aria-labelledby="agent-title"
    >
      <div className="mb-14 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Architecture</p>
        <h2 id="agent-title" className="mt-3 text-3xl font-semibold sm:text-4xl">
          How the work actually gets done.
        </h2>
        <p className="mt-4 text-sm text-text-muted sm:text-base">
          Not a diagram of somebody else&rsquo;s framework — this is the shape of the systems I build: intent-routed,
          parallel, grounded in real sources, and measured well enough to improve itself.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-12">
        {/* Left: the diagram. Native sticky, so it cannot desync from scroll.
            Desktop only: on a single-column mobile grid a sticky item is trapped in
            its own row and just overlaps the beats stacked beneath it, so mobile
            gets the diagram in normal flow with a compact beat list. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-glass)] py-6">
            <PipelineDiagram activeStage={activeStage} />
          </div>
        </div>

        {/* Right: the narrative. Each stage is a scroll beat that drives the diagram. */}
        <ol ref={narrativeRef} className="flex flex-col">
          {PIPELINE_STAGES.map((stage, index) => {
            const isActive = activeStage === index;
            return (
              <li
                key={stage.id}
                // Tall beats give the playhead room to travel on desktop. On mobile
                // they collapse to a compact list rather than a seven-screen scroll.
                className="flex flex-col justify-center py-6 lg:min-h-[52vh] lg:py-0"
                aria-current={isActive ? "step" : undefined}
              >
                <div
                  className={`border-l-2 pl-6 transition-all duration-500 ${
                    isActive ? "border-accent opacity-100" : "border-[var(--border)] opacity-40"
                  }`}
                >
                  <p className="font-mono text-xs tabular-nums text-text-quiet">
                    {String(index + 1).padStart(2, "0")} / {String(PIPELINE_STAGES.length).padStart(2, "0")}
                  </p>
                  <h3
                    className={`mt-2 text-xl font-semibold transition-colors sm:text-2xl ${
                      isActive ? "text-accent" : "text-text"
                    }`}
                  >
                    {stage.label}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted sm:text-base">{stage.copy}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
