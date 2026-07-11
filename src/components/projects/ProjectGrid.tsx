import { useState } from "react";
import { PROJECTS, PROJECT_CATEGORIES, type ProjectCategory } from "@/data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid() {
  const [active, setActive] = useState<ProjectCategory | "all">("all");
  const filtered = active === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  return (
    <section id="projects" className="mx-auto max-w-5xl px-6 py-20" aria-labelledby="projects-title">
      <div className="mb-8 flex flex-col items-center gap-6 text-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Selected systems</p>
          <h2 id="projects-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
            Evidence, not a copied CV.
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Filter projects by category"
          className="flex flex-wrap justify-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
        >
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active === cat.id}
              onClick={() => setActive(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                active === cat.id ? "bg-accent text-black" : "text-text-muted hover:text-text"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
