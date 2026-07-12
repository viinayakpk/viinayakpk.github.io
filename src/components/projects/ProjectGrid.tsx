import { useState } from "react";
import { PROJECTS, PROJECT_CATEGORIES, type ProjectCategory } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid() {
  const [active, setActive] = useState<ProjectCategory>("agentic");
  const filtered = PROJECTS.filter((p) => p.category === active);

  return (
    <section id="work" className="mx-auto max-w-5xl px-6 py-20" aria-labelledby="projects-title">
      <div className="mb-8 flex flex-col items-center gap-6 text-center">
        <h2 id="projects-title" className="text-3xl font-semibold sm:text-4xl">
          Find My Work
        </h2>

        <div
          role="tablist"
          aria-label="Filter work by category"
          className="flex flex-wrap justify-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
        >
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active === cat.id}
              onClick={() => setActive(cat.id)}
              className={`relative rounded-full px-4 py-1.5 text-sm transition-colors ${
                active === cat.id ? "bg-[var(--bg-elevated)] text-text shadow-sm" : "text-text-muted hover:text-text"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div key={active} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 motion-safe:animate-[fadein_0.4s_ease]">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
