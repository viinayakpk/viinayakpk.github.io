import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  const Wrapper = project.href ? "a" : "div";
  const linkProps = project.href
    ? { href: project.href, target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-accent/50"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-text">{project.title}</h3>
        {project.href && (
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 size-4 shrink-0 text-text-muted transition-colors group-hover:text-accent"
            aria-hidden="true"
          >
            <path
              d="M18 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <p className="text-sm text-text-muted">{project.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        {project.meta && (
          <span className="rounded-full bg-accent/15 px-2.5 py-1 font-mono text-xs text-accent">
            {project.meta}
          </span>
        )}
        {project.stack.map((tech) => (
          <span key={tech} className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-text-muted">
            {tech}
          </span>
        ))}
      </div>
    </Wrapper>
  );
}
