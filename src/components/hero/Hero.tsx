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
      className="relative grid min-h-[94vh] grid-cols-1 items-center gap-8 px-6 pb-16 pt-32 sm:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-16 lg:pb-24"
      aria-labelledby="hero-title"
    >
      <div className="relative z-10 order-2 flex max-w-2xl flex-col items-start gap-5 lg:order-1 lg:pb-12">
        <div className="flex items-center gap-3">
          <span className="section-kicker">AI systems / robotics / applied ML</span>
          <span className="hidden h-px w-16 bg-accent/60 sm:block" aria-hidden="true" />
        </div>
        <h1 id="hero-title" className="display-heading max-w-2xl text-[3.2rem] leading-[0.92] sm:text-7xl lg:text-[5.8rem]">
          Vinayak Paroonon
          <br />
          <span className="text-accent">Kooloth</span>
        </h1>
        <p className="max-w-xl text-xl font-medium leading-tight text-text sm:text-3xl">
          <RoleScramble text={current.role} />
        </p>
        <div className="max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
          <BioRotator text={current.bio} />
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {current.role} {current.bio}
        </span>

        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href="/resume.pdf"
            className="rounded-[var(--radius-sm)] border border-accent bg-accent px-6 py-3 text-sm font-semibold text-[#201116] transition-transform hover:-translate-y-0.5"
          >
            View CV
          </a>
          <a
            href="https://linkedin.com/in/vinayakparoononkooloth"
            target="_blank"
            rel="noreferrer"
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-glass)] px-6 py-3 text-sm font-medium text-text transition-colors hover:border-accent/60"
          >
            Connect
          </a>
        </div>

        <div className="mt-8 grid w-full max-w-xl grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
          <div>
            <span className="font-mono text-xl text-accent">1–3s</span>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">clinical AI response time</p>
          </div>
          <div>
            <span className="font-mono text-xl text-accent-cyan">60%</span>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">workflow effort reduced</p>
          </div>
          <div>
            <span className="font-mono text-xl text-accent-2">94.5%</span>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">CNN–LSTM accuracy</p>
          </div>
        </div>
      </div>

      <div className="relative order-1 h-[390px] sm:h-[500px] lg:order-2 lg:h-[650px]">
        <div className="pointer-events-none absolute inset-[12%_6%_10%_4%] rounded-[2rem] border border-accent/20 bg-accent/5" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-[9%] left-[17%] right-[13%] h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
        <div className="absolute left-[7%] top-[16%] z-10 hidden max-w-[170px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-glass)] p-3 text-xs text-text-muted backdrop-blur md:block">
          <span className="section-kicker text-[0.56rem]">Live system</span>
          <p className="mt-2 leading-relaxed">A small machine for turning messy inputs into useful decisions.</p>
        </div>
        <SceneCanvas fallback={<PosterFallback label="3D robot mascot" />}>
          <HeroRobotScene />
        </SceneCanvas>
      </div>
    </section>
  );
}
