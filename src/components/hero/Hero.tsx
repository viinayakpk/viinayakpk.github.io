import { lazy } from "react";
import SceneCanvas from "@/scenes/shared/SceneCanvas";
import PosterFallback from "@/scenes/shared/PosterFallback";
import RoleScramble from "./RoleScramble";
import BioRotator from "./BioRotator";
import { useCyclingIndex } from "./useCyclingIndex";
import { HERO_ROLES } from "@/data/hero";

const HeroRobotScene = lazy(() => import("@/scenes/hero-robot/HeroRobotScene"));

export default function Hero() {
  const index = useCyclingIndex(HERO_ROLES.length, 3200);
  const current = HERO_ROLES[index];

  return (
    <section
      id="top"
      className="grid min-h-[92vh] grid-cols-1 items-center gap-8 px-6 pt-28 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-4 lg:px-16"
      aria-labelledby="hero-title"
    >
      <div className="order-2 flex flex-col items-start gap-5 lg:order-1">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent">Open across the EU</p>
        <h1 id="hero-title" className="text-4xl font-semibold leading-[1.05] sm:text-6xl">
          Vinayak Paroonon
          <br />
          Kooloth
        </h1>
        <p className="text-2xl font-medium text-text sm:text-3xl">
          <RoleScramble text={current.role} />
        </p>
        <BioRotator text={current.bio} />
        <span className="sr-only" role="status" aria-live="polite">
          {current.role} {current.bio}
        </span>

        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href="/resume.pdf"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
          >
            View CV
          </a>
          <a
            href="https://linkedin.com/in/vinayakparoononkooloth"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-medium text-text transition-colors hover:border-accent/60"
          >
            Connect
          </a>
        </div>
      </div>

      <div className="order-1 h-[360px] sm:h-[440px] lg:order-2 lg:h-[520px]">
        <SceneCanvas fallback={<PosterFallback label="3D robot mascot" />}>
          <HeroRobotScene />
        </SceneCanvas>
      </div>
    </section>
  );
}
