interface PosterFallbackProps {
  label: string;
}

/** Static, WebGL-free stand-in shown under prefers-reduced-motion or on low-capability devices. */
export default function PosterFallback({ label }: PosterFallbackProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div
        className="relative flex aspect-square w-full max-w-[280px] items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface)]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255, 155, 88, 0.16), transparent 42%), url('/portfolio-atmosphere.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        role="img"
        aria-label={label}
      >
        <div className="size-20 rounded-[var(--radius-md)] border border-accent/60 bg-[var(--bg)]/70 shadow-[0_0_40px_var(--glow)]" />
        <span className="absolute bottom-4 left-4 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}
