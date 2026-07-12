import * as THREE from "three";

/**
 * Every piece of the escapement is GENERATED, not modelled.
 *
 * This is the quiet reason the machine was buildable at all. A letterpress or a
 * tool-head would have needed a GLB — a real 3D asset, authored in Blender, shipped
 * over the wire. Horology is different: a gear is not a sculpture, it is a formula.
 * Teeth are a periodic function of angle. A hairspring is an Archimedean spiral. A
 * balance wheel is a torus with spokes. All of it falls out of trigonometry, which
 * means the entire hero costs **zero bytes of assets** and every dimension stays a
 * tunable number rather than something baked into a binary.
 */

/** Shared extrude settings — a small bevel is what catches the studio rig's key light. */
const EXTRUDE = (thickness: number): THREE.ExtrudeGeometryOptions => ({
  depth: thickness,
  bevelEnabled: true,
  bevelThickness: thickness * 0.12,
  bevelSize: thickness * 0.1,
  bevelSegments: 2,
  curveSegments: 24,
});

/** Centres an extruded shape on its own thickness, so it rotates about its true axis. */
function centred(geometry: THREE.ExtrudeGeometry, thickness: number): THREE.ExtrudeGeometry {
  geometry.translate(0, 0, -thickness / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/** Circular lightening holes — the thing that makes a clock wheel read as a *clock* wheel. */
function pierce(shape: THREE.Shape, count: number, ringRadius: number, holeRadius: number) {
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    const path = new THREE.Path();
    path.absarc(Math.cos(a) * ringRadius, Math.sin(a) * ringRadius, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(path);
  }
}

export interface GearOptions {
  radius: number;
  teeth: number;
  toothDepth: number;
  thickness: number;
  bore: number;
  /** Number of lightening holes in the web. 0 for a solid wheel. */
  spokes?: number;
}

/**
 * A standard train wheel: trapezoidal teeth on a pierced web.
 *
 * The tooth is four points per period — root, tip, tip, root — walked around the
 * circle. Not an involute curve (the real thing), but at hero scale the difference
 * is sub-pixel, and the silhouette is what sells it.
 */
export function makeGear({ radius, teeth, toothDepth, thickness, bore, spokes = 0 }: GearOptions): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  const rootHalf = step * 0.32;
  const tipHalf = step * 0.17;
  const rTip = radius + toothDepth;

  for (let i = 0; i < teeth; i += 1) {
    const a = i * step;
    const pts: [number, number][] = [
      [a - rootHalf, radius],
      [a - tipHalf, rTip],
      [a + tipHalf, rTip],
      [a + rootHalf, radius],
    ];
    pts.forEach(([ang, r], k) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && k === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();

  const boreHole = new THREE.Path();
  boreHole.absarc(0, 0, bore, 0, Math.PI * 2, true);
  shape.holes.push(boreHole);

  if (spokes > 0) pierce(shape, spokes, radius * 0.62, radius * 0.17);

  return centred(new THREE.ExtrudeGeometry(shape, EXTRUDE(thickness)), thickness);
}

/**
 * The escape wheel — the CRITIC.
 *
 * Its teeth are deliberately ASYMMETRIC, and that asymmetry is the entire point of
 * an escapement. Each tooth has a long, gently-rising impulse face and then a sharp
 * vertical drop. The pallet fork rides up the slow face (work being done, under
 * control) and then falls off the cliff (one unit of work released). A symmetric
 * gear cannot regulate anything; it is the cliff that makes the tick.
 *
 * This is also why the runaway looks so violent when you pull the fork out: nothing
 * is left to catch the cliff, so the wheel simply free-falls through every tooth at
 * once.
 */
export function makeEscapeWheel({
  radius,
  teeth,
  toothDepth,
  thickness,
  bore,
}: Omit<GearOptions, "spokes">): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  const rTip = radius + toothDepth;

  for (let i = 0; i < teeth; i += 1) {
    const a = i * step;
    // root -> long rising impulse face -> sharp drop back to root
    const p0: [number, number] = [a, radius];
    const p1: [number, number] = [a + step * 0.62, rTip];
    const p2: [number, number] = [a + step * 0.72, radius];

    [p0, p1, p2].forEach(([ang, r], k) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && k === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();

  const boreHole = new THREE.Path();
  boreHole.absarc(0, 0, bore, 0, Math.PI * 2, true);
  shape.holes.push(boreHole);

  pierce(shape, 5, radius * 0.6, radius * 0.15);

  return centred(new THREE.ExtrudeGeometry(shape, EXTRUDE(thickness)), thickness);
}

/**
 * The pallet fork — the piece the visitor can physically pull out of the machine.
 *
 * Two jewelled pallets on a Y-shaped lever pivoting at the tail. It is small, it is
 * the least impressive-looking part, and removing it destroys the entire system.
 * That asymmetry between visual weight and functional weight is exactly the argument
 * the hero is making about critics in an agent loop.
 */
export function makePalletFork(thickness: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0.06, 0);
  shape.lineTo(0.42, 0.30); // entry arm
  shape.lineTo(0.52, 0.24);
  shape.lineTo(0.20, -0.02);
  shape.lineTo(0.52, -0.28); // exit arm
  shape.lineTo(0.42, -0.34);
  shape.lineTo(0.06, -0.05);
  shape.lineTo(-0.30, -0.04); // tail, back to the pivot
  shape.lineTo(-0.30, 0.04);
  shape.closePath();

  const pivot = new THREE.Path();
  pivot.absarc(-0.24, 0, 0.035, 0, Math.PI * 2, true);
  shape.holes.push(pivot);

  return centred(new THREE.ExtrudeGeometry(shape, EXTRUDE(thickness)), thickness);
}

/** An Archimedean spiral — the hairspring, and the mainspring's coil. r grows linearly with angle. */
class SpiralCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private readonly innerRadius: number,
    private readonly outerRadius: number,
    private readonly turns: number,
  ) {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const angle = t * this.turns * Math.PI * 2;
    const r = this.innerRadius + (this.outerRadius - this.innerRadius) * t;
    return target.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
  }
}

/**
 * The hairspring (on the balance) and the mainspring (in the barrel). Same curve,
 * different scale — which is a real fact about clocks, not a shortcut.
 */
export function makeSpiral(
  innerRadius: number,
  outerRadius: number,
  turns: number,
  tubeRadius: number,
): THREE.TubeGeometry {
  const curve = new SpiralCurve(innerRadius, outerRadius, turns);
  return new THREE.TubeGeometry(curve, Math.ceil(turns * 32), tubeRadius, 6, false);
}

/**
 * The balance wheel — the EVAL. A heavy rim on thin spokes: all of its mass is as far
 * from the axis as possible, which is what gives it the rotational inertia to keep
 * oscillating at a steady rate. It is the part of the machine whose entire job is to
 * *measure time consistently* so everything else can be trusted.
 */
export function makeBalanceRim(radius: number, tubeRadius: number): THREE.TorusGeometry {
  return new THREE.TorusGeometry(radius, tubeRadius, 10, 64);
}

/** Frames, plates, arbors — the boring parts that hold the interesting parts in place. */
export function makeArbor(radius: number, length: number): THREE.CylinderGeometry {
  const g = new THREE.CylinderGeometry(radius, radius, length, 12);
  g.rotateX(Math.PI / 2); // align to +z, the plane the wheels turn in
  return g;
}
