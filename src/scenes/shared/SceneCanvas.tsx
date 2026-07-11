import { lazy, Suspense, type ReactNode } from "react";
import type { CanvasProps } from "@react-three/fiber";
import { useInView } from "./useInView";
import { useReducedMotion } from "./useReducedMotion";
import { useDeviceCapability } from "./useDeviceCapability";

const SceneCanvasImpl = lazy(() => import("./SceneCanvasImpl"));

interface SceneCanvasProps extends Omit<CanvasProps, "children"> {
  children: ReactNode;
  fallback: ReactNode;
  dprCap?: number;
}

/**
 * Shared mount policy for every heavy r3f scene on the site: never construct a
 * WebGL context under reduced-motion or on a low-capability device, and fully
 * unmount (not just pause) once scrolled far out of view so contexts don't
 * accumulate across a long page. `@react-three/fiber`/three.js are only pulled
 * in via the lazy SceneCanvasImpl import, keeping them out of the main chunk.
 */
export default function SceneCanvas({ children, fallback, dprCap = 1.5, className, ...canvasProps }: SceneCanvasProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const prefersReducedMotion = useReducedMotion();
  const capable = useDeviceCapability();

  const shouldRender3D = capable && !prefersReducedMotion;

  return (
    <div ref={ref} className={className} style={{ width: "100%", height: "100%" }}>
      {shouldRender3D && inView ? (
        <Suspense fallback={fallback}>
          <SceneCanvasImpl dprCap={dprCap} {...canvasProps}>
            {children}
          </SceneCanvasImpl>
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
