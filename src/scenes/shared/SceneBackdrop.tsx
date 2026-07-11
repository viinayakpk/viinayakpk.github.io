import { GradientTexture, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useThemeColors } from "./useThemeColors";

interface SceneBackdropProps {
  /**
   * "atmosphere": a large gradient sky-dome with soft floating motes, for the
   * hero - the edges match the page background exactly so there's no visible
   * seam, but the center glows with depth instead of being flat black.
   * "flat": just fills with the exact page background colour - used where
   * the scene itself (RAG Loop's bloom/particles) should carry the visual
   * interest and the backdrop's only job is to stop postprocessing's
   * opaque clear colour from showing as a mismatched box.
   */
  mode?: "atmosphere" | "flat";
}

/**
 * @react-three/postprocessing's EffectComposer does not preserve the
 * canvas's alpha transparency by default - without an explicit background,
 * the composer fills with its own clear colour, which shows up as a visibly
 * boxed rectangle against the page. Every scene that uses EffectComposer
 * needs one of these.
 */
export default function SceneBackdrop({ mode = "flat" }: SceneBackdropProps) {
  const theme = useThemeColors();

  if (mode === "flat") {
    return <color attach="background" args={[theme.bg]} />;
  }

  return (
    <>
      <mesh scale={20}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial side={THREE.BackSide} depthWrite={false} toneMapped={false}>
          <GradientTexture stops={[0, 0.5, 1]} colors={[theme.bg, theme.bgElevated, theme.bg]} size={256} />
        </meshBasicMaterial>
      </mesh>
      <Sparkles count={40} scale={[4, 3, 2]} size={2} speed={0.15} opacity={0.35} color="#6ee7ff" />
    </>
  );
}
