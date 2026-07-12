import { Suspense, useState, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

interface SceneCanvasImplProps extends Omit<CanvasProps, "children"> {
  children: ReactNode;
  dprCap: number;
}

/**
 * The actual `<Canvas>` mount — split into its own module so `@react-three/fiber`
 * (and three.js transitively) only ever loads behind a dynamic import, never in
 * the main entry chunk. Imported exclusively via SceneCanvas.tsx's `lazy()` call.
 */
export default function SceneCanvasImpl({ children, dprCap, ...canvasProps }: SceneCanvasImplProps) {
  /*
   * Device pixel ratio is the single highest-leverage performance knob there is, and
   * it is the one people leave on the floor. Fill rate scales with the SQUARE of DPR,
   * so a phone reporting DPR 3 is rendering NINE times the pixels of DPR 1. Capping it
   * is one line and it can double the frame rate on mobile; nothing else in this file
   * comes close.
   */
  const [dpr, setDpr] = useState(dprCap);

  return (
    <Canvas
      dpr={dpr}
      /*
       * `touch-action: pan-y` is what lets a draggable hero coexist with a scrolling
       * page — the #1 practical trap here, and still an open unsolved issue upstream in
       * R3F. It tells the browser: vertical swipes belong to the PAGE (scroll away),
       * horizontal drags belong to US. Combined with the fact that our drag handlers sit
       * on the meshes (so R3F's raycaster gates them, and a touch landing on empty canvas
       * never starts a drag at all), a visitor can always scroll past the hero even
       * though the hero is grabbable.
       *
       * The usual advice — `touch-action: none` — would trap the user's thumb inside the
       * canvas and make the page unscrollable on a phone. Never do that.
       */
      style={{ touchAction: "pan-y" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      performance={{ min: 0.5 }}
      /*
       * Neutral, not ACES. ACES is the reflexive default and it is wrong for this site:
       * it desaturates and rolls off highlights hard, which fights a cream page and turns
       * warm brass muddy. NeutralToneMapping (three r162+) is Khronos' PBR-neutral curve,
       * built to preserve albedo hue and saturation — designed for exactly this case.
       */
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      {...canvasProps}
    >
      {/*
        PerformanceMonitor is the real adaptive-quality system: it samples FPS and fires
        onDecline when the frame rate is genuinely struggling. AdaptiveDpr on its own does
        NOT do this — a very common and expensive misconception. AdaptiveDpr only reacts
        to R3F's transient `regress()` signal (i.e. "the user is dragging right now"), so
        the two are complementary, not redundant: PerformanceMonitor handles "this device
        is weak", AdaptiveDpr handles "this instant is busy".
      */}
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(1)}
        onFallback={() => setDpr(1)}
        onIncline={() => setDpr(dprCap)}
      />
      <AdaptiveDpr pixelated />
      {/* Turns raycasting off entirely while the scene is regressed. */}
      <AdaptiveEvents />

      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
