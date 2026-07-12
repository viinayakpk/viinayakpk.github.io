interface PosterFallbackProps {
  label: string;
}

/** Teeth for the poster gears. Drawn, not simulated — this is the still frame. */
function gearPath(cx: number, cy: number, r: number, teeth: number, toothH: number): string {
  const parts: string[] = [];
  for (let i = 0; i < teeth; i += 1) {
    const a = (i / teeth) * Math.PI * 2;
    const w = (Math.PI / teeth) * 0.5;
    const [x1, y1] = [cx + Math.cos(a - w) * r, cy + Math.sin(a - w) * r];
    const [x2, y2] = [cx + Math.cos(a - w * 0.6) * (r + toothH), cy + Math.sin(a - w * 0.6) * (r + toothH)];
    const [x3, y3] = [cx + Math.cos(a + w * 0.6) * (r + toothH), cy + Math.sin(a + w * 0.6) * (r + toothH)];
    const [x4, y4] = [cx + Math.cos(a + w) * r, cy + Math.sin(a + w) * r];
    parts.push(`${i === 0 ? "M" : "L"}${x1.toFixed(2)},${y1.toFixed(2)}`);
    parts.push(`L${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} L${x4.toFixed(2)},${y4.toFixed(2)}`);
  }
  return `${parts.join(" ")} Z`;
}

/**
 * The WebGL-free stand-in, shown under `prefers-reduced-motion` and on devices that
 * cannot run the escapement.
 *
 * This used to be a `background-image: url('/portfolio-atmosphere.png')` — a **2.84 MB
 * PNG**. CSS background images are LCP-eligible, so that single file was almost
 * certainly the Largest Contentful Paint element on mobile, at roughly fourteen
 * seconds on a 4G connection. It was, by a wide margin, the most expensive thing on
 * the site — and it cost more than every 3D decision put together.
 *
 * It is now inline SVG: a few hundred bytes, resolution-independent, themed from CSS
 * custom properties (so it is correct in both themes for free), and it actually
 * depicts the machine it stands in for instead of an abstract gradient.
 */
export default function PosterFallback({ label }: PosterFallbackProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <svg
        viewBox="0 0 400 300"
        className="h-auto w-full max-w-[420px]"
        role="img"
        aria-label={label}
      >
        {/* Mainspring barrel — the planner, holding wound intent. */}
        <g opacity="0.9">
          <path
            d={gearPath(120, 150, 54, 24, 7)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="120" cy="150" r="40" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.45" />
          {/* the coiled spring itself */}
          <path
            d="M120,150 m0,-4 a4,4 0 1,1 -4,4 a8,8 0 1,1 8,8 a12,12 0 1,1 -12,-12 a16,16 0 1,1 16,16 a20,20 0 1,1 -20,-20 a24,24 0 1,1 24,24 a28,28 0 1,1 -28,-28 a32,32 0 1,1 32,32"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.1"
            opacity="0.55"
          />
          <circle cx="120" cy="150" r="4.5" fill="var(--accent)" />
        </g>

        {/* Escape wheel — the critic, releasing work one tooth at a time. */}
        <g opacity="0.85">
          <path
            d={gearPath(248, 128, 34, 15, 8)}
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="248" cy="128" r="3.5" fill="var(--text-muted)" />
        </g>

        {/* Pallet fork — the piece you can pull out. */}
        <g opacity="0.9">
          <path
            d="M292,150 L268,132 M292,150 L268,168 M292,150 L306,150"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="292" cy="150" r="4" fill="var(--accent)" />
        </g>

        {/* Balance wheel — the eval, oscillating, keeping time. */}
        <g opacity="0.8">
          <circle cx="330" cy="196" r="30" fill="none" stroke="var(--text-muted)" strokeWidth="2.4" />
          <path
            d="M330,166 L330,226 M300,196 L360,196"
            stroke="var(--text-muted)"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <circle cx="330" cy="196" r="3" fill="var(--text-muted)" />
        </g>

        <text
          x="200"
          y="272"
          textAnchor="middle"
          className="fill-[var(--text-quiet)]"
          style={{ fontSize: 9, letterSpacing: "0.18em", fontFamily: "var(--font-mono)" }}
        >
          PLANNER · CRITIC · EVAL
        </text>
      </svg>
    </div>
  );
}
