import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mulberry32 } from "@/lib/prng";
import { useScrollStore } from "@/store/scrollStore";

const COUNT = 260;
const CLUSTER_CENTER = new THREE.Vector3(-1.5, 0.1, -0.3);

interface Point {
  assembled: THREE.Vector3;
  exploded: THREE.Vector3;
  spinSpeed: number;
}

export default function VectorGalaxy() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const points = useMemo<Point[]>(() => {
    const rand = mulberry32(42);
    return Array.from({ length: COUNT }, () => {
      const assembled = new THREE.Vector3(
        CLUSTER_CENTER.x + (rand() - 0.5) * 0.28,
        CLUSTER_CENTER.y + (rand() - 0.5) * 0.28,
        CLUSTER_CENTER.z + (rand() - 0.5) * 0.28,
      );

      const radius = 1.1 + rand() * 1.5;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(rand() * 2 - 1);
      const exploded = new THREE.Vector3(
        CLUSTER_CENTER.x + radius * Math.sin(phi) * Math.cos(theta) * 1.3,
        radius * Math.cos(phi) * 0.8,
        CLUSTER_CENTER.z + radius * Math.sin(phi) * Math.sin(theta) * 1.3,
      );

      return { assembled, exploded, spinSpeed: 0.1 + rand() * 0.3 };
    });
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = useScrollStore.getState().explodeFactor;
    const time = state.clock.elapsedTime;

    points.forEach((point, i) => {
      dummy.position.lerpVectors(point.assembled, point.exploded, t);
      dummy.position.y += Math.sin(time * point.spinSpeed + i) * 0.02 * t;
      const scale = 0.85 + t * 0.6;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[0.018, 6, 6]} />
      <meshStandardMaterial color="#6ee7ff" emissive="#6ee7ff" emissiveIntensity={0.9} />
    </instancedMesh>
  );
}
