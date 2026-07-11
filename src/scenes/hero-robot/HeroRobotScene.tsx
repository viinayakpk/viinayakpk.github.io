import { PerspectiveCamera } from "@react-three/drei";
import RobotModel from "./RobotModel";
import { usePointerRef } from "./usePointerRef";

export default function HeroRobotScene() {
  const pointer = usePointerRef();

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.3, 2.6]} fov={35} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 2]} intensity={2.2} color="#f4f6ff" />
      <directionalLight position={[-1.6, 1.2, -1.8]} intensity={1.6} color="#6ee7ff" />
      <pointLight position={[-1.5, -0.5, 1]} intensity={0.8} color="#a78bfa" />
      <RobotModel pointer={pointer} />
    </>
  );
}
