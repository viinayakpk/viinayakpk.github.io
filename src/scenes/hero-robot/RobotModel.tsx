import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import CoreNode from "./CoreNode";
import { ScreenFaceTexture } from "./ScreenFaceTexture";

const MATTE = { roughness: 0.75, metalness: 0.15 };

function useScreenFace() {
  const face = useMemo(() => new ScreenFaceTexture(), []);
  const frameCount = useRef(0);

  useFrame(() => {
    frameCount.current += 1;
    if (frameCount.current % 4 === 0) face.update();
  });

  useEffect(() => () => face.dispose(), [face]);

  return face.texture;
}

interface RobotModelProps {
  pointer: MutableRefObject<{ x: number; y: number }>;
}

export default function RobotModel({ pointer }: RobotModelProps) {
  const group = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const faceTexture = useScreenFace();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.1) * 0.06;
      const targetRotY = pointer.current.x * 0.35;
      const targetRotX = -pointer.current.y * 0.18;
      group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.06;
      group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.06;
    }
    if (leftArm.current) leftArm.current.rotation.z = 0.25 + Math.sin(t * 1.4) * 0.06;
    if (rightArm.current) rightArm.current.rotation.z = -0.25 - Math.sin(t * 1.4 + 0.6) * 0.06;
  });

  return (
    <group ref={group}>
      {/* Head */}
      <group position={[0, 0.78, 0]}>
        <RoundedBox args={[0.46, 0.4, 0.42]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#2b3145" {...MATTE} />
        </RoundedBox>
        {/* Screen face */}
        <mesh position={[0, 0, 0.215]}>
          <planeGeometry args={[0.32, 0.24]} />
          <meshBasicMaterial map={faceTexture} toneMapped={false} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
          <meshStandardMaterial color="#4b5163" {...MATTE} />
        </mesh>
        <mesh position={[0, 0.335, 0]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#6ee7ff" emissive="#6ee7ff" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Neck joint */}
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.1, 12]} />
        <meshStandardMaterial color="#3a4055" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Chest / torso */}
      <group position={[0, 0.24, 0]}>
        <RoundedBox args={[0.56, 0.5, 0.36]} radius={0.09} smoothness={4}>
          <meshStandardMaterial color="#252a3a" {...MATTE} />
        </RoundedBox>
        {/* Translucent chest panel */}
        <RoundedBox args={[0.3, 0.3, 0.06]} radius={0.05} smoothness={4} position={[0, 0.02, 0.16]}>
          <meshPhysicalMaterial
            color="#0b0d14"
            transmission={0.85}
            thickness={0.4}
            roughness={0.15}
            ior={1.4}
            clearcoat={1}
          />
        </RoundedBox>
        <group position={[0, 0.02, 0.14]}>
          <CoreNode />
        </group>
      </group>

      {/* Hip joint */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.08, 12]} />
        <meshStandardMaterial color="#3a4055" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Arms */}
      <group ref={leftArm} position={[-0.33, 0.36, 0]}>
        <mesh position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.06, 0.26, 4, 8]} />
          <meshStandardMaterial color="#323a52" {...MATTE} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#4b5163" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.33, 0.36, 0]}>
        <mesh position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.06, 0.26, 4, 8]} />
          <meshStandardMaterial color="#323a52" {...MATTE} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#4b5163" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* Legs */}
      <group position={[-0.14, -0.32, 0]}>
        <mesh>
          <capsuleGeometry args={[0.065, 0.2, 4, 8]} />
          <meshStandardMaterial color="#323a52" {...MATTE} />
        </mesh>
        <mesh position={[0, -0.16, 0.03]}>
          <boxGeometry args={[0.13, 0.06, 0.2]} />
          <meshStandardMaterial color="#4b5163" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
      <group position={[0.14, -0.32, 0]}>
        <mesh>
          <capsuleGeometry args={[0.065, 0.2, 4, 8]} />
          <meshStandardMaterial color="#323a52" {...MATTE} />
        </mesh>
        <mesh position={[0, -0.16, 0.03]}>
          <boxGeometry args={[0.13, 0.06, 0.2]} />
          <meshStandardMaterial color="#4b5163" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
