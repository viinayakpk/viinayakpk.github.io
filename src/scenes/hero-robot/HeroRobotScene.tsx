import { PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import RobotModel from "./RobotModel";
import SceneBackdrop from "@/scenes/shared/SceneBackdrop";
import { usePointerRef } from "./usePointerRef";

export default function HeroRobotScene() {
  const pointer = usePointerRef();

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.25, 3.1]} fov={32} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 2]} intensity={1.8} color="#f4f6ff" />
      <directionalLight position={[-1.6, 1.2, -1.8]} intensity={1.2} color="#6ee7ff" />
      <pointLight position={[-1.5, -0.5, 1]} intensity={0.6} color="#a78bfa" />

      <Environment preset="night" background={false} environmentIntensity={0.35} />

      <SceneBackdrop mode="atmosphere" />

      <group scale={0.7} position={[0, -0.15, 0]}>
        <RobotModel pointer={pointer} />
      </group>

      <ContactShadows position={[0, -0.72, 0]} opacity={0.4} blur={2.6} far={1.2} scale={2.4} color="#000000" />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.3} intensity={0.6} mipmapBlur />
        <Vignette darkness={0.4} offset={0.25} />
      </EffectComposer>
    </>
  );
}
