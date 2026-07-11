import { lazy, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useScrollStore } from "@/store/scrollStore";
import { EXPERIENCE } from "@/data/experience";
import SceneCanvas from "@/scenes/shared/SceneCanvas";
import PosterFallback from "@/scenes/shared/PosterFallback";
import TimelineEntry from "@/components/timeline/TimelineEntry";

const RagLoopScene = lazy(() => import("@/scenes/rag-loop/RagLoopScene"));

export default function RagLoopSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Pinning only makes sense in the two-column layout (lg+); below that,
      // the canvas and timeline stack in one column and should scroll normally.
      mm.add("(min-width: 1024px)", () => {
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          pin: canvasWrapRef.current,
          start: "top top+=96",
          // Explicit runway rather than "bottom bottom": the timeline text's
          // natural height is only slightly taller than one viewport, which
          // left almost no scroll distance for the scrub to play out over.
          end: `+=${EXPERIENCE.length * 650}`,
          scrub: 0.6,
          onUpdate: (self) => {
            useScrollStore.getState().setExplodeFactor(self.progress);
            const index = Math.min(
              EXPERIENCE.length - 1,
              Math.floor(self.progress * EXPERIENCE.length),
            );
            useScrollStore.getState().setActiveIndex(index);
          },
        });
        return () => trigger.kill();
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef} className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="work-title">
      <div className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Work experience</p>
        <h2 id="work-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
          The RAG loop, built one role at a time.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div ref={canvasWrapRef} className="h-[380px] sm:h-[440px] lg:h-[65vh]">
          <SceneCanvas fallback={<PosterFallback label="Agentic RAG loop 3D diagram" />}>
            <RagLoopScene />
          </SceneCanvas>
        </div>

        <div className="flex flex-col gap-10">
          {EXPERIENCE.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
