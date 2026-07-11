import { CanvasTexture, SRGBColorSpace } from "three";

const WIDTH = 128;
const HEIGHT = 96;
const COLS = 16;
const ROWS = 12;

/**
 * Drives a small offscreen 2D canvas rendering a live attention-heatmap-style
 * grid, exposed as a THREE.CanvasTexture. Deliberately a plain 2D canvas
 * rather than a render-to-texture pass — cheap, and only needs to look
 * "alive," not be numerically meaningful.
 */
export class ScreenFaceTexture {
  readonly texture: CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private cellValues: Float32Array;
  private targetValues: Float32Array;

  constructor() {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    this.ctx = ctx;

    this.cellValues = new Float32Array(COLS * ROWS);
    this.targetValues = new Float32Array(COLS * ROWS);
    this.randomizeTargets();

    this.texture = new CanvasTexture(canvas);
    this.texture.colorSpace = SRGBColorSpace;
    this.draw();
  }

  private randomizeTargets() {
    for (let i = 0; i < this.targetValues.length; i++) {
      this.targetValues[i] = Math.random() < 0.15 ? Math.random() : this.targetValues[i] * 0.3;
    }
  }

  /** Call periodically (not every frame) from the owning component. */
  update() {
    if (Math.random() < 0.08) this.randomizeTargets();
    for (let i = 0; i < this.cellValues.length; i++) {
      this.cellValues[i] += (this.targetValues[i] - this.cellValues[i]) * 0.25;
    }
    this.draw();
    this.texture.needsUpdate = true;
  }

  private draw() {
    const { ctx } = this;
    ctx.fillStyle = "#050608";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const cellW = WIDTH / COLS;
    const cellH = HEIGHT / ROWS;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const v = this.cellValues[row * COLS + col];
        const alpha = Math.min(1, v);
        ctx.fillStyle = `rgba(110, 231, 255, ${alpha.toFixed(3)})`;
        ctx.fillRect(col * cellW + 1, row * cellH + 1, cellW - 2, cellH - 2);
      }
    }
  }

  dispose() {
    this.texture.dispose();
  }
}
