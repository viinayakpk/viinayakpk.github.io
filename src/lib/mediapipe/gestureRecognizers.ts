interface Point {
  x: number;
  y: number;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Wrist-to-middle-MCP distance as a scale reference so thresholds are hand-size/distance independent. */
function handScale(landmarks: Point[]): number {
  return dist(landmarks[0], landmarks[9]) || 1;
}

const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

export function isOpenPalm(landmarks: Point[]): boolean {
  const scale = handScale(landmarks);
  const avgTipDistance =
    FINGERTIP_INDICES.reduce((sum, i) => sum + dist(landmarks[i], landmarks[0]), 0) /
    FINGERTIP_INDICES.length;
  return avgTipDistance / scale > 2.1;
}

export function isPinch(landmarks: Point[]): boolean {
  const scale = handScale(landmarks);
  return dist(landmarks[4], landmarks[8]) / scale < 0.55;
}
