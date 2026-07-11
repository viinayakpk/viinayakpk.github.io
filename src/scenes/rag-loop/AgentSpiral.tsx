import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollStore } from "@/store/scrollStore";

const NODE_COUNT = 12;

export default function AgentSpiral() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = useScrollStore.getState().explodeFactor;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i / NODE_COUNT) * Math.PI * 2 + time * 0.15;
      const radiusAssembled = 0.55;
      const radiusExploded = 1.15;
      const radius = THREE.MathUtils.lerp(radiusAssembled, radiusExploded, t);
      const heightSpread = THREE.MathUtils.lerp(0.05, 0.9, t);
      const y = (i / NODE_COUNT - 0.5) * heightSpread;

      dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      dummy.scale.setScalar(0.7 + t * 0.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]}>
      <torusGeometry args={[0.035, 0.014, 8, 12]} />
      <meshStandardMaterial color="#ff9d5c" emissive="#ff9d5c" emissiveIntensity={0.7} roughness={0.4} />
    </instancedMesh>
  );
}
