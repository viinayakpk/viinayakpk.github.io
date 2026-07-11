import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useScrollStore } from "@/store/scrollStore";

const LAYER_COUNT = 4;
const LAYER_COLORS = ["#6ee7ff", "#7fd8ff", "#93c9ff", "#a78bfa"];

export default function PipelineNodes() {
  const layerRefs = useRef<THREE.Mesh[]>([]);
  const encoderRef = useRef<THREE.Mesh>(null);
  const responseRef = useRef<THREE.Mesh>(null);
  const lineToEncoderRef = useRef<THREE.Object3D & { material?: THREE.Material }>(null);
  const lineToResponseRef = useRef<THREE.Object3D & { material?: THREE.Material }>(null);

  useFrame(() => {
    const t = useScrollStore.getState().explodeFactor;

    layerRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const centered = i - (LAYER_COUNT - 1) / 2;
      mesh.position.y = centered * (0.16 + t * 0.22);
    });

    if (encoderRef.current) {
      encoderRef.current.position.x = -0.9 - t * 0.5;
      const mat = encoderRef.current.material as THREE.Material & { opacity: number };
      mat.opacity = 1 - t * 0.7;
    }
    if (responseRef.current) {
      responseRef.current.position.x = 0.9 + t * 0.5;
      const mat = responseRef.current.material as THREE.Material & { opacity: number };
      mat.opacity = 1 - t * 0.7;
    }
    const lineOpacity = Math.max(0, 1 - t * 1.4);
    const encMat = lineToEncoderRef.current?.material as THREE.Material & { opacity: number } | undefined;
    const resMat = lineToResponseRef.current?.material as THREE.Material & { opacity: number } | undefined;
    if (encMat) encMat.opacity = lineOpacity;
    if (resMat) resMat.opacity = lineOpacity;
  });

  return (
    <group>
      {/* LLM transformer stack */}
      {Array.from({ length: LAYER_COUNT }).map((_, i) => (
        <mesh key={i} ref={(el) => el && (layerRefs.current[i] = el)}>
          <boxGeometry args={[0.62, 0.08, 0.62]} />
          <meshStandardMaterial
            color={LAYER_COLORS[i]}
            emissive={LAYER_COLORS[i]}
            emissiveIntensity={0.35}
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* Query encoder node */}
      <mesh ref={encoderRef} position={[-0.9, 0, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#eef2ff" emissive="#a78bfa" emissiveIntensity={0.4} transparent opacity={1} />
      </mesh>

      {/* Response / output node */}
      <mesh ref={responseRef} position={[0.9, 0, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#eef2ff" emissive="#6ee7ff" emissiveIntensity={0.4} transparent opacity={1} />
      </mesh>

      <Line
        ref={lineToEncoderRef as never}
        points={[
          [-0.9, 0, 0],
          [0, 0, 0],
        ]}
        color="#6ee7ff"
        transparent
        opacity={1}
        lineWidth={1}
      />
      <Line
        ref={lineToResponseRef as never}
        points={[
          [0, 0, 0],
          [0.9, 0, 0],
        ]}
        color="#6ee7ff"
        transparent
        opacity={1}
        lineWidth={1}
      />
    </group>
  );
}
