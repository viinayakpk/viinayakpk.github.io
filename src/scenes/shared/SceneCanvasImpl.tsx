import { Suspense, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";

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
  return (
    <Canvas dpr={[1, dprCap]} gl={{ antialias: true, alpha: true }} {...canvasProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
