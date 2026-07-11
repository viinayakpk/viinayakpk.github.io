import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 10;

/** The "neural core" glowing inside the robot's translucent chest panel. */
export default function CoreNode() {
  const coreRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const nodeSeeds = useMemo(
    () =>
      Array.from({ length: NODE_COUNT }, (_, i) => ({
        radius: 0.22 + Math.random() * 0.08,
        speed: 0.3 + Math.random() * 0.4,
        offset: (i / NODE_COUNT) * Math.PI * 2,
        tilt: Math.random() * Math.PI,
      })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      const pulse = 0.6 + Math.sin(t * 1.6) * 0.35;
      const material = coreRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = pulse;
    }
    if (particlesRef.current) {
      nodeSeeds.forEach((seed, i) => {
        const angle = t * seed.speed + seed.offset;
        dummy.position.set(
          Math.cos(angle) * seed.radius,
          Math.sin(angle * 0.7) * seed.radius * 0.6,
          Math.sin(angle + seed.tilt) * seed.radius,
        );
        dummy.updateMatrix();
        particlesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.13, 1]} />
        <meshStandardMaterial
          color="#6ee7ff"
          emissive="#6ee7ff"
          emissiveIntensity={1.4}
          roughness={0.2}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#6ee7ff" intensity={2.2} distance={1.2} />
      <instancedMesh ref={particlesRef} args={[undefined, undefined, NODE_COUNT]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={1.8} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
