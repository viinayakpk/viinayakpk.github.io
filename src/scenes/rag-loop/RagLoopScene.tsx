import { PerspectiveCamera } from "@react-three/drei";
import PipelineNodes from "./PipelineNodes";
import VectorGalaxy from "./VectorGalaxy";
import RetrievalBeam from "./RetrievalBeam";
import AgentSpiral from "./AgentSpiral";

export default function RagLoopScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.6, 3.4]} fov={40} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 2]} intensity={1.8} color="#f4f6ff" />
      <directionalLight position={[-2, -1, -2]} intensity={1} color="#6ee7ff" />

      <PipelineNodes />
      <VectorGalaxy />
      <RetrievalBeam />
      <AgentSpiral />
    </>
  );
}
