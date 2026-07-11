import { PerspectiveCamera, Html } from "@react-three/drei";
import PipelineNodes from "./PipelineNodes";
import VectorGalaxy from "./VectorGalaxy";
import RetrievalBeam from "./RetrievalBeam";
import AgentSpiral from "./AgentSpiral";

function Label({ position, children }: { position: [number, number, number]; children: string }) {
  return (
    <Html position={position} center distanceFactor={6} occlude={false} zIndexRange={[1, 0]}>
      <span className="hidden whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--surface-glass)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-text-muted backdrop-blur sm:inline-block">
        {children}
      </span>
    </Html>
  );
}

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

      <Label position={[-1.5, 0.55, -0.3]}>Vector index</Label>
      <Label position={[0, 0.45, 0]}>LLM context</Label>
      <Label position={[0, -0.8, 0]}>Agent tool-call loop</Label>
    </>
  );
}
