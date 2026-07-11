import { lazy, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useScrollStore } from "@/store/scrollStore";
import SceneCanvas from "@/scenes/shared/SceneCanvas";
import PosterFallback from "@/scenes/shared/PosterFallback";

const ArchitectureScene = lazy(() => import("@/scenes/architecture/ArchitectureScene"));

export const ARCHITECTURE_STEPS = [
  {
    id: "frame",
    number: "01",
    label: "Frame",
    title: "Start with the workflow, not the model.",
    copy: "Clinical questions, CRM notes, and noisy documents become a precise problem before any retrieval or generation begins.",
  },
  {
    id: "route",
    number: "02",
    label: "Route",
    title: "Let intent choose the path.",
    copy: "A multilingual intent layer decides whether the system needs a direct answer, a temporal lookup, a multi-hop trace, or a tool call.",
  },
  {
    id: "retrieve",
    number: "03",
    label: "Retrieve",
    title: "Use more than one kind of memory.",
    copy: "Dense, sparse, temporal, and graph retrieval work as coordinated strategies instead of one generic RAG wrapper.",
  },
  {
    id: "act",
    number: "04",
    label: "Act",
    title: "Give agents bounded tools and clear edges.",
    copy: "Models connect to APIs, databases, reports, and local engineering tools through explicit interfaces that can be inspected and tested.",
  },
  {
    id: "verify",
    number: "05",
    label: "Verify",
    title: "Make the answer earn trust.",
    copy: "Evaluation, provenance, latency, and failure paths stay visible so a useful answer is also an operable system.",
  },
  {
    id: "ship",
    number: "06",
    label: "Ship",
    title: "Turn the loop into a product surface.",
    copy: "FastAPI, Node.js, PostgreSQL, Docker, MLflow, and browser workflows carry the intelligence to the people who need it.",
  },
] as const;

export default function ArchitectureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const updateState = (progress: number) => {
        const safeProgress = Math.min(1, Math.max(0, progress));
        const index = Math.min(
          ARCHITECTURE_STEPS.length - 1,
          Math.floor(safeProgress * ARCHITECTURE_STEPS.length),
        );
        useScrollStore.getState().setExplodeFactor(safeProgress);
        useScrollStore.getState().setActiveIndex(index);
      };

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          pin: canvasWrapRef.current,
          start: "top top+=92",
          end: `+=${ARCHITECTURE_STEPS.length * 620}`,
          scrub: 0.7,
          anticipatePin: 1,
          onUpdate: (self) => updateState(self.progress),
        });
        return () => trigger.kill();
      });

      mm.add("(max-width: 1023px)", () => {
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 25%",
          scrub: 0.5,
          onUpdate: (self) => updateState(self.progress),
        });
        return () => trigger.kill();
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const activeIndex = useScrollStore((state) => state.activeIndex);

  return (
    <section
      id="architecture"
      ref={sectionRef}
      className="architecture-section mx-auto max-w-7xl px-6 py-28 sm:px-10 lg:px-16 lg:py-40"
      aria-labelledby="architecture-title"
    >
      <div className="mx-auto mb-12 max-w-3xl lg:mb-16">
        <p className="section-kicker">Agent architecture / scroll study</p>
        <h2 id="architecture-title" className="display-heading mt-4 text-4xl leading-[0.98] sm:text-6xl">
          The intelligence is in the connections.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
          A guided view of how I move from an ambiguous request to a reliable system: route the question,
          retrieve the right evidence, let agents act within boundaries, then ship the result.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(310px,0.75fr)] lg:gap-14">
        <div ref={canvasWrapRef} className="architecture-canvas glass-panel relative overflow-hidden lg:top-0">
          <div className="pointer-events-none absolute inset-x-6 top-5 z-10 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-quiet">
            <span>agent / architecture</span>
            <span>{String(activeIndex + 1).padStart(2, "0")} / {ARCHITECTURE_STEPS.length}</span>
          </div>
          <SceneCanvas dprCap={1.2} fallback={<PosterFallback label="Interactive agent architecture diagram" />}>
            <ArchitectureScene />
          </SceneCanvas>
          <div className="pointer-events-none absolute inset-x-6 bottom-5 z-10 flex items-end justify-between gap-4 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-text-quiet">
            <span>question → evidence → action</span>
            <span className="hidden text-accent-cyan sm:inline">scroll to inspect</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:pt-3">
          {ARCHITECTURE_STEPS.map((step, index) => {
            const isActive = activeIndex === index;
            return (
              <article
                key={step.id}
                className={`border-l-2 py-2 pl-5 transition-all duration-300 ${
                  isActive ? "border-accent opacity-100" : "border-[var(--border)] opacity-55"
                }`}
              >
                <div className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.14em]">
                  <span className={isActive ? "text-accent" : "text-text-quiet"}>{step.number}</span>
                  <span className={isActive ? "text-text" : "text-text-quiet"}>{step.label}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-tight text-text">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
