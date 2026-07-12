import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useScrollStore } from "@/store/scrollStore";
import TimelineEntry from "@/components/timeline/TimelineEntry";
import { EXPERIENCE } from "@/data/experience";

/**
 * The work-experience timeline.
 *
 * This used to pin a third WebGL canvas beside the timeline, rendering a second copy
 * of the same agent mark already used in the hero. That canvas is gone: it was a
 * whole extra GL context to duplicate an image the visitor had seen 30 seconds
 * earlier, which cheapened the hero rather than reinforcing it.
 *
 * The pin went with it — pinning existed only to hold that canvas steady. The scroll
 * trigger stays, because it drives which entry is highlighted, and that is a real
 * piece of the reading experience rather than decoration.
 */
export default function WorkExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => {
          const index = Math.min(EXPERIENCE.length - 1, Math.floor(self.progress * EXPERIENCE.length));
          useScrollStore.getState().setActiveIndex(index);
        },
      });

      return () => trigger.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-3xl px-6 py-20 sm:px-10"
      aria-labelledby="experience-title"
    >
      <h2 id="experience-title" className="mb-12 text-center text-3xl font-bold sm:text-4xl">
        <span className="text-accent">Orchestrating</span> My Work Experience.
      </h2>

      <div className="flex flex-col gap-10">
        {EXPERIENCE.map((entry, index) => (
          <TimelineEntry key={entry.id} entry={entry} index={index} />
        ))}
      </div>
    </section>
  );
}
