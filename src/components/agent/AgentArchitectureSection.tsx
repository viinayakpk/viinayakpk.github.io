import { useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import PipelineDiagram from "./PipelineDiagram";
import { PIPELINE_STAGES } from "@/data/agentPipeline";

/**
 * The architecture section.
 *
 * This used to mount a WebGL canvas rendering the pipeline as a 3D graph. It was cut,
 * and the reason is worth keeping: the graph spans many columns, and at any camera
 * distance that made the labels legible you could only see two or three nodes at once.
 * So the single thing the section exists to communicate — the *shape* of the system —
 * was the one thing the 3D could never show you.
 *
 * There is also no card around the diagram any more. A bordered, tinted surface made it
 * look like a screenshot of somebody else's tool that had been pasted into the page. It
 * now sits directly on the background and belongs to the site.
 *
 * What survives from the 3D version is the part that was actually good: the scroll
 * narrative. Each beat is a trigger, and the playhead drives the diagram, so the
 * architecture assembles itself as you read down it.
 */
export default function AgentArchitectureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const narrativeRef = useRef<HTMLOListElement>(null);

  const [activeStage, setActiveStage] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const count = PIPELINE_STAGES.length;

      // The only thing scroll drives here, and it only ever sets an integer — so the
      // whole section costs ten React renders across its entire scroll, not one a frame.
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
      <div className="mb-16 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Architecture</p>
        <h2 id="agent-title" className="mt-3 text-3xl font-semibold sm:text-4xl">
          How the work actually gets done.
        </h2>
        <p className="mt-4 text-sm text-text-muted sm:text-base">
          Not a diagram of somebody else&rsquo;s framework — this is the shape of the systems I build: guarded at the
          edges, intent-routed, planned into a DAG, fanned out across specialised sub-agents, grounded in real
          sources, and measured well enough to improve itself.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:gap-16">
        {/* Left: the diagram. Native sticky, so it cannot desync from scroll. Desktop
            only — on a single-column mobile grid a sticky item is trapped in its own row
            and simply overlaps the beats stacked beneath it, so mobile gets the diagram
            in normal flow, laid out tall and read like a poster. */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <PipelineDiagram activeStage={activeStage} />
        </div>

        {/* Right: the narrative. Each stage is a scroll beat that drives the diagram. */}
        <ol ref={narrativeRef} className="flex flex-col">
          {PIPELINE_STAGES.map((stage, index) => {
            const isActive = activeStage === index;
            return (
              <li
                key={stage.id}
                // Tall beats give the playhead room to travel on desktop. On mobile they
                // collapse to a compact list rather than a ten-screen scroll.
                className="flex flex-col justify-center py-6 lg:min-h-[46vh] lg:py-0"
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
