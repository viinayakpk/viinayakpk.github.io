// Deterministic PRNG (mulberry32) so the scattered layout is stable across renders/sessions.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ScatterPoint {
  xPct: number;
  yPct: number;
  scale: number;
}

/** Scatters `count` points across the field, avoiding a centered exclusion zone for headline text. */
export function scatterPoints(count: number, seed = 7): ScatterPoint[] {
  const rand = mulberry32(seed);
  const points: ScatterPoint[] = [];
  const cols = Math.ceil(Math.sqrt(count * 1.6));
  const rows = Math.ceil(count / cols);
  let i = 0;

  for (let row = 0; row < rows && i < count; row++) {
    for (let col = 0; col < cols && i < count; col++) {
      const cellW = 100 / cols;
      const cellH = 100 / rows;
      const xPct = cellW * col + cellW * 0.5 + (rand() - 0.5) * cellW * 0.7;
      const yPct = cellH * row + cellH * 0.5 + (rand() - 0.5) * cellH * 0.7;

      const distFromCenter = Math.hypot(xPct - 50, (yPct - 50) * 2.4);
      if (distFromCenter < 32) continue;

      points.push({ xPct, yPct, scale: 0.75 + rand() * 0.5 });
      i++;
    }
  }
  return points;
}
