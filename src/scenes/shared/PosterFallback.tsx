interface PosterFallbackProps {
  label: string;
}

/** Static, WebGL-free stand-in shown under prefers-reduced-motion or on low-capability devices. */
export default function PosterFallback({ label }: PosterFallbackProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="size-40 rounded-[2rem] border border-[var(--border)]"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, var(--glow), transparent 70%), var(--surface)",
        }}
        role="img"
        aria-label={label}
      />
    </div>
  );
}
