import { lazy } from "react";
import { ArrowRight, LinkSimple } from "@phosphor-icons/react";
import SceneCanvas from "@/scenes/shared/SceneCanvas";
import PosterFallback from "@/scenes/shared/PosterFallback";
import BioRotator from "./BioRotator";
import { useCyclingIndex } from "./useCyclingIndex";
import { HERO_ROLES } from "@/data/hero";

const Escapement = lazy(() => import("@/scenes/escapement/Escapement"));

export default function Hero() {
  const index = useCyclingIndex(HERO_ROLES.length, 3200);
  const current = HERO_ROLES[index];

  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] flex-col items-center px-6 pb-16 pt-24 text-center sm:px-10"
      aria-labelledby="hero-title"
    >
      {/*
        The machine. It used to be a 0.42-radius sphere in a 340×280 box — about 4% of
        its own frame, which read as a loading spinner. It now fills the frame, which is
        the entire point: this object is the argument the site is making.

        Camera FOV 32, not the 75 default. That single number does more for how
        expensive this looks than any material: 75° is a wide-angle lens, it distorts,
        and it is the visual signature of hobby three.js. Product photographers shoot at
        roughly an 85mm equivalent. A long lens is flatter, calmer, more considered.
      */}
      <div className="relative h-[380px] w-full max-w-[980px] sm:h-[480px] lg:h-[560px]">
        <SceneCanvas
          fallback={<PosterFallback label="A clock escapement: planner, critic and eval as a mechanical movement" />}
          camera={{ fov: 32, position: [0, 0, 11.5], near: 0.1, far: 50 }}
          shadows
        >
          <Escapement />
        </SceneCanvas>
      </div>

      <p
        key={current.role}
        className="display-heading mt-2 text-2xl italic text-accent motion-safe:animate-[fadein_0.5s_ease] sm:text-3xl"
      >
        {current.role}
      </p>
      <h1 id="hero-title" className="display-heading -mt-1 text-5xl leading-[0.95] sm:text-6xl lg:text-[4rem]">
        Engineer.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
        Vinayak builds agentic AI systems: multi-agent orchestration, LLM automation pipelines, and
        evidence-grounded retrieval, from clinical AI to autonomous internal agents across the EU.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href="mailto:vinayakparoononkooloth@gmail.com"
          className="flex items-center gap-2 rounded-[var(--radius-full)] px-6 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
        >
          Connect
          <LinkSimple size={14} weight="bold" aria-hidden="true" />
        </a>
        <a
          href="#work"
          className="flex items-center gap-2 rounded-[var(--radius-full)] px-6 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--btn-secondary-bg)", color: "var(--btn-secondary-text)" }}
        >
          See Work
          <ArrowRight size={14} weight="bold" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-4 max-w-md text-xs text-text-quiet">
        <BioRotator text={current.bio} />
      </div>
    </section>
  );
}
