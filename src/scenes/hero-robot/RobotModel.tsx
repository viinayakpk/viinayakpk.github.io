import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import CoreNode from "./CoreNode";
import { ScreenFaceTexture } from "./ScreenFaceTexture";

// Warm, saturated "toy" body colour instead of generic dark-tech grey - the
// single biggest lever research turned up for reading as a character rather
// than a primitive placeholder.
const SHELL = { roughness: 0.42, metalness: 0.08 };
const SHELL_COLOR = "#ff8c4a";
const SHELL_SHADOW = "#e0692a";
const JOINT = { roughness: 0.35, metalness: 0.55 };
const JOINT_COLOR = "#2a2d3a";

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
  const bodyGroup = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const eyelidL = useRef<THREE.Mesh>(null);
  const eyelidR = useRef<THREE.Mesh>(null);
  const faceTexture = useScreenFace();
  const nextBlink = useRef(2 + Math.random() * 2);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      const targetRotY = pointer.current.x * 0.35;
      const targetRotX = -pointer.current.y * 0.18;
      group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.06;
      group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.06;
    }
    if (bodyGroup.current) {
      // Idle bob with a touch of squash-and-stretch so the peak/trough don't
      // just translate - the body compresses slightly at the low point.
      const bob = Math.sin(t * 1.1);
      bodyGroup.current.position.y = bob * 0.055;
      const squash = 1 - bob * 0.025;
      bodyGroup.current.scale.set(1 / squash, squash, 1 / squash);
    }
    if (leftArm.current) leftArm.current.rotation.z = 0.25 + Math.sin(t * 1.4) * 0.06;
    if (rightArm.current) rightArm.current.rotation.z = -0.25 - Math.sin(t * 1.4 + 0.6) * 0.06;

    // Periodic blink - small, cheap, disproportionate payoff for "alive."
    nextBlink.current -= delta;
    if (nextBlink.current < 0.12 && nextBlink.current > 0) {
      const s = 1 - Math.sin(((0.12 - nextBlink.current) / 0.12) * Math.PI) * 0.92;
      if (eyelidL.current) eyelidL.current.scale.y = s;
      if (eyelidR.current) eyelidR.current.scale.y = s;
    } else if (nextBlink.current <= 0) {
      if (eyelidL.current) eyelidL.current.scale.y = 1;
      if (eyelidR.current) eyelidR.current.scale.y = 1;
      nextBlink.current = 2.5 + Math.random() * 3;
    }
  });

  return (
    <group ref={group}>
      <group ref={bodyGroup}>
        {/* Head - oversized relative to body for a chibi/mascot read */}
        <group position={[0, 0.8, 0]}>
          <RoundedBox args={[0.56, 0.48, 0.5]} radius={0.14} smoothness={4}>
            <meshStandardMaterial color={SHELL_COLOR} {...SHELL} />
          </RoundedBox>
          {/* Screen face */}
          <mesh position={[0, 0.01, 0.255]}>
            <planeGeometry args={[0.34, 0.22]} />
            <meshBasicMaterial map={faceTexture} toneMapped={false} />
          </mesh>
          {/* Simple expressive eyes over the screen, blink-animated */}
          <mesh ref={eyelidL} position={[-0.09, 0.045, 0.262]}>
            <circleGeometry args={[0.028, 16]} />
            <meshBasicMaterial color="#eef8ff" toneMapped={false} />
          </mesh>
          <mesh ref={eyelidR} position={[0.09, 0.045, 0.262]}>
            <circleGeometry args={[0.028, 16]} />
            <meshBasicMaterial color="#eef8ff" toneMapped={false} />
          </mesh>
          {/* Cheek accents for warmth */}
          <mesh position={[-0.19, -0.06, 0.24]}>
            <circleGeometry args={[0.03, 16]} />
            <meshBasicMaterial color="#ffb38a" transparent opacity={0.6} toneMapped={false} />
          </mesh>
          <mesh position={[0.19, -0.06, 0.24]}>
            <circleGeometry args={[0.03, 16]} />
            <meshBasicMaterial color="#ffb38a" transparent opacity={0.6} toneMapped={false} />
          </mesh>
          {/* Antenna */}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
            <meshStandardMaterial color={JOINT_COLOR} {...JOINT} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.032, 12, 12]} />
            <meshStandardMaterial color="#6ee7ff" emissive="#6ee7ff" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>

        {/* Neck joint */}
        <RoundedBox args={[0.16, 0.08, 0.16]} radius={0.03} smoothness={3} position={[0, 0.56, 0]}>
          <meshStandardMaterial color={JOINT_COLOR} {...JOINT} />
        </RoundedBox>

        {/* Chest / torso */}
        <group position={[0, 0.24, 0]}>
          <RoundedBox args={[0.5, 0.42, 0.34]} radius={0.13} smoothness={4}>
            <meshStandardMaterial color={SHELL_SHADOW} {...SHELL} />
          </RoundedBox>
          {/* Translucent chest panel */}
          <RoundedBox args={[0.26, 0.26, 0.06]} radius={0.05} smoothness={4} position={[0, 0.02, 0.15]}>
            <meshPhysicalMaterial
              color="#0b0d14"
              transmission={0.85}
              thickness={0.4}
              roughness={0.15}
              ior={1.4}
              clearcoat={1}
            />
          </RoundedBox>
          <group position={[0, 0.02, 0.13]}>
            <CoreNode />
          </group>
        </group>

        {/* Hip joint */}
        <RoundedBox args={[0.18, 0.07, 0.16]} radius={0.025} smoothness={3} position={[0, -0.02, 0]}>
          <meshStandardMaterial color={JOINT_COLOR} {...JOINT} />
        </RoundedBox>

        {/* Arms - rounded rectangular blocks, not cylindrical capsules, to match the head/chest's firm boxy language */}
        <group ref={leftArm} position={[-0.29, 0.38, 0]}>
          <RoundedBox args={[0.13, 0.24, 0.13]} radius={0.045} smoothness={3} position={[0, -0.13, 0]}>
            <meshStandardMaterial color={SHELL_COLOR} {...SHELL} />
          </RoundedBox>
          <RoundedBox args={[0.1, 0.08, 0.1]} radius={0.03} smoothness={3} position={[0, -0.27, 0]}>
            <meshStandardMaterial color={JOINT_COLOR} {...JOINT} />
          </RoundedBox>
        </group>
        <group ref={rightArm} position={[0.29, 0.38, 0]}>
          <RoundedBox args={[0.13, 0.24, 0.13]} radius={0.045} smoothness={3} position={[0, -0.13, 0]}>
            <meshStandardMaterial color={SHELL_COLOR} {...SHELL} />
          </RoundedBox>
          <RoundedBox args={[0.1, 0.08, 0.1]} radius={0.03} smoothness={3} position={[0, -0.27, 0]}>
            <meshStandardMaterial color={JOINT_COLOR} {...JOINT} />
          </RoundedBox>
        </group>

        {/* Legs - short, stubby, rectangular blocks for the chibi proportions */}
        <group position={[-0.13, -0.16, 0]}>
          <RoundedBox args={[0.13, 0.12, 0.13]} radius={0.04} smoothness={3}>
            <meshStandardMaterial color={SHELL_SHADOW} {...SHELL} />
          </RoundedBox>
          <RoundedBox args={[0.12, 0.06, 0.18]} radius={0.02} smoothness={3} position={[0, -0.09, 0.03]}>
            <meshStandardMaterial color={JOINT_COLOR} {...JOINT} />
          </RoundedBox>
        </group>
        <group position={[0.13, -0.16, 0]}>
          <RoundedBox args={[0.13, 0.12, 0.13]} radius={0.04} smoothness={3}>
            <meshStandardMaterial color={SHELL_SHADOW} {...SHELL} />
          </RoundedBox>
          <RoundedBox args={[0.12, 0.06, 0.18]} radius={0.02} smoothness={3} position={[0, -0.09, 0.03]}>
            <meshStandardMaterial color={JOINT_COLOR} {...JOINT} />
          </RoundedBox>
        </group>
      </group>
    </group>
  );
}
