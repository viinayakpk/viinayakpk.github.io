import { Environment, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import SceneBackdrop from "@/scenes/shared/SceneBackdrop";
import ArchitectureNetwork from "./ArchitectureNetwork";

export default function ArchitectureScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.15, 5.7]} fov={35} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[2.5, 3.5, 4]} intensity={2.1} color="#fff1e6" />
      <directionalLight position={[-3, 0.5, -2]} intensity={1.2} color="#8377ff" />
      <pointLight position={[0, 0.15, 1.7]} intensity={1.8} distance={4} color="#ff9b58" />
      <Environment preset="night" background={false} environmentIntensity={0.28} />
      <SceneBackdrop mode="atmosphere" />
      <ArchitectureNetwork />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.24} intensity={0.65} mipmapBlur />
        <Vignette darkness={0.38} offset={0.28} />
      </EffectComposer>
    </>
  );
}
