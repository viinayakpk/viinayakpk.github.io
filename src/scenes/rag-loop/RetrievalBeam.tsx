import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mulberry32 } from "@/lib/prng";
import { useScrollStore } from "@/store/scrollStore";

const COUNT = 14;
const TARGET = new THREE.Vector3(0, 0, 0);

export default function RetrievalBeam() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const origins = useMemo(() => {
    const rand = mulberry32(99);
    return Array.from({ length: COUNT }, () => {
      const radius = 1.3 + rand() * 1.2;
      const theta = rand() * Math.PI * 2;
      return new THREE.Vector3(
        -1.5 + radius * Math.cos(theta) * 1.1,
        (rand() - 0.5) * 1.4,
        -0.3 + radius * Math.sin(theta) * 1.1,
      );
    });
  }, []);

  const phases = useMemo(() => {
    const rand = mulberry32(123);
    return Array.from({ length: COUNT }, () => rand());
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = useScrollStore.getState().explodeFactor;
    // Envelope: only visible/active in the middle of the scroll range.
    const envelope = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
    if (materialRef.current) materialRef.current.opacity = envelope;

    const time = state.clock.elapsedTime * 0.35;
    origins.forEach((origin, i) => {
      const progress = (time + phases[i]) % 1;
      dummy.position.lerpVectors(origin, TARGET, progress);
      const scale = envelope * (0.6 + 0.4 * Math.sin(progress * Math.PI));
      dummy.scale.setScalar(Math.max(0.001, scale));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[0.028, 8, 8]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#a78bfa"
        emissive="#a78bfa"
        emissiveIntensity={1.4}
        transparent
        opacity={0}
      />
    </instancedMesh>
  );
}
