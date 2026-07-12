import { ArrowUpRight, GithubLogo } from "@phosphor-icons/react";
import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  const Wrapper = project.href ? "a" : "div";
  const linkProps = project.href
    ? { href: project.href, target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`relative flex aspect-video w-full items-end bg-gradient-to-br p-4 ${project.gradient ?? "from-[#111111] to-[#2a78d6]"}`}>
        <h3 className="text-lg font-semibold leading-tight text-white drop-shadow-sm">{project.title}</h3>
        {project.meta && (
          <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {project.meta}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-sm leading-relaxed text-text-muted">{project.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, 3).map((tech) => (
              <span key={tech} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-text-muted">
                {tech}
              </span>
            ))}
          </div>
          {project.href ? (
            <GithubLogo weight="fill" className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-accent" aria-hidden="true" />
          ) : (
            <ArrowUpRight weight="bold" className="size-4 shrink-0 text-text-quiet" aria-hidden="true" />
          )}
        </div>
      </div>
    </Wrapper>
  );
}
