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
      <ambientLight intensity={0.58} />
      <directionalLight position={[2.8, 3.8, 3]} intensity={2.3} color="#fff0e4" />
      <directionalLight position={[-2.2, 1.4, -1.8]} intensity={1.5} color="#8778ff" />
      <pointLight position={[-1.4, -0.4, 1.4]} intensity={1.2} color="#83e4e5" />
      <pointLight position={[1.5, 0.7, 1.6]} intensity={1.1} color="#ff9b58" />

      <Environment preset="night" background={false} environmentIntensity={0.35} />

      <SceneBackdrop mode="atmosphere" />

      <group scale={0.7} position={[0, -0.15, 0]}>
        <RobotModel pointer={pointer} />
      </group>

      <ContactShadows position={[0, -0.78, 0]} opacity={0.52} blur={2.2} far={1.4} scale={2.8} color="#05060b" />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.82} luminanceSmoothing={0.28} intensity={0.72} mipmapBlur />
        <Vignette darkness={0.34} offset={0.3} />
      </EffectComposer>
    </>
  );
}
