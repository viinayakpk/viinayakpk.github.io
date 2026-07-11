import { useMemo, useRef } from "react";
import { Line, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollStore } from "@/store/scrollStore";

type NodeKind = "input" | "router" | "memory" | "agent" | "answer" | "verify";

interface NodeSpec {
  id: string;
  label: string;
  kind: NodeKind;
  position: [number, number, number];
  color: string;
  revealAt: number;
}

const NODES: NodeSpec[] = [
  { id: "input", label: "INPUT", kind: "input", position: [-2.05, 0, 0], color: "#f0c1a3", revealAt: 0 },
  { id: "router", label: "INTENT", kind: "router", position: [-0.95, 0, 0.08], color: "#ff9b58", revealAt: 0.12 },
  { id: "dense", label: "DENSE", kind: "memory", position: [0.05, 0.88, 0], color: "#83e4e5", revealAt: 0.28 },
  { id: "sparse", label: "SPARSE", kind: "memory", position: [0.15, 0.02, 0], color: "#83e4e5", revealAt: 0.3 },
  { id: "temporal", label: "TEMPORAL", kind: "memory", position: [0.05, -0.84, 0], color: "#a78bfa", revealAt: 0.34 },
  { id: "agent", label: "AGENT / TOOLS", kind: "agent", position: [1.1, 0.4, 0.04], color: "#ff9b58", revealAt: 0.52 },
  { id: "answer", label: "SYNTHESIS", kind: "answer", position: [2.05, 0, 0.08], color: "#f0c1a3", revealAt: 0.7 },
  { id: "verify", label: "EVAL", kind: "verify", position: [1.1, -0.56, 0.04], color: "#a78bfa", revealAt: 0.8 },
];

const EDGES: Array<[string, string]> = [
  ["input", "router"],
  ["router", "dense"],
  ["router", "sparse"],
  ["router", "temporal"],
  ["dense", "agent"],
  ["sparse", "agent"],
  ["temporal", "agent"],
  ["agent", "answer"],
  ["answer", "verify"],
  ["verify", "agent"],
];

function getNode(id: string) {
  return NODES.find((node) => node.id === id)!;
}

function NetworkNode({ node }: { node: NodeSpec }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const progress = useScrollStore.getState().explodeFactor;
    const active = Math.min(1, Math.max(0, (progress - node.revealAt + 0.08) * 8));
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(active, active, active), 0.08);
      groupRef.current.rotation.y += 0.002 + active * 0.004;
    }
    if (coreRef.current) {
      const material = coreRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.45 + active * (0.35 + Math.sin(state.clock.elapsedTime * 2.1) * 0.18);
    }
  });

  const isCore = node.kind === "router" || node.kind === "answer";
  return (
    <group ref={groupRef} position={node.position}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[isCore ? 0.22 : 0.14, isCore ? 1 : 0]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.28}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[isCore ? 0.34 : 0.23, 0.012, 8, 32]} />
        <meshBasicMaterial color={node.color} transparent opacity={0.72} toneMapped={false} />
      </mesh>
      {node.kind === "agent" && (
        <RoundedBox args={[0.42, 0.18, 0.18]} radius={0.04} smoothness={3} position={[0, -0.25, 0]}>
          <meshStandardMaterial color="#171a2b" roughness={0.3} metalness={0.72} />
        </RoundedBox>
      )}
    </group>
  );
}

function FlowLine({ from, to }: { from: NodeSpec; to: NodeSpec }) {
  const progress = useScrollStore((state) => state.explodeFactor);
  const visible = Math.min(1, Math.max(0, (progress - Math.min(from.revealAt, to.revealAt) + 0.05) * 5));
  const color = to.kind === "verify" ? "#a78bfa" : to.kind === "memory" ? "#83e4e5" : "#ff9b58";

  return (
    <Line
      points={[from.position, to.position]}
      color={color}
      transparent
      opacity={0.14 + visible * 0.62}
      lineWidth={visible > 0.65 ? 1.6 : 0.8}
    />
  );
}

function FlowPackets() {
  const packetRefs = useRef<THREE.Mesh[]>([]);
  const paths = useMemo(() => EDGES.map(([fromId, toId]) => [getNode(fromId).position, getNode(toId).position]), []);

  useFrame((state) => {
    const progress = useScrollStore.getState().explodeFactor;
    paths.forEach(([from, to], index) => {
      const packet = packetRefs.current[index];
      if (!packet) return;
      const phase = (state.clock.elapsedTime * 0.26 + index * 0.17) % 1;
      const visible = Math.min(1, Math.max(0, (progress - index / EDGES.length + 0.2) * 5));
      packet.position.lerpVectors(new THREE.Vector3(...from), new THREE.Vector3(...to), phase);
      packet.scale.setScalar(visible * (0.55 + Math.sin(phase * Math.PI) * 0.55));
    });
  });

  return (
    <>
      {paths.map(([from], index) => (
        <mesh key={index} ref={(node) => node && (packetRefs.current[index] = node)} position={from}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={index % 3 === 0 ? "#fff1e6" : "#83e4e5"} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

export default function ArchitectureNetwork() {
  const progress = useScrollStore((state) => state.explodeFactor);
  const tilt = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!tilt.current) return;
    tilt.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.08;
    tilt.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.16) * 0.025;
  });

  return (
    <group ref={tilt} position={[0, 0, 0]} scale={1 + progress * 0.04}>
      <mesh position={[0, 0, -0.24]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.55, 0.008, 8, 64]} />
        <meshBasicMaterial color="#ff9b58" transparent opacity={0.18} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.85, 1.86, 96]} />
        <meshBasicMaterial color="#83e4e5" transparent opacity={0.12} toneMapped={false} />
      </mesh>
      {EDGES.map(([fromId, toId]) => (
        <FlowLine key={`${fromId}-${toId}`} from={getNode(fromId)} to={getNode(toId)} />
      ))}
      <FlowPackets />
      {NODES.map((node) => <NetworkNode key={node.id} node={node} />)}
    </group>
  );
}
