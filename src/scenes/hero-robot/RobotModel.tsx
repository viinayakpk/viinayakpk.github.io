import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Edges, Line, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import CoreNode from "./CoreNode";
import { ScreenFaceTexture } from "./ScreenFaceTexture";

const SHELL = { roughness: 0.3, metalness: 0.28 };
const SHELL_LIGHT = "#e9884c";
const SHELL_DARK = "#9d4428";
const GRAPHITE = "#171a28";
const GRAPHITE_LIGHT = "#2b3044";
const CYAN = "#83e4e5";

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

function Joint({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.075, 0.075, 0.12, 12]} />
        <meshStandardMaterial color={GRAPHITE_LIGHT} roughness={0.24} metalness={0.82} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.012, 8, 20]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <sphereGeometry args={[0.026, 10, 10]} />
        <meshBasicMaterial color="#fff1e6" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Panel({
  args,
  position,
  color = GRAPHITE,
  radius = 0.04,
}: {
  args: [number, number, number];
  position?: [number, number, number];
  color?: string;
  radius?: number;
}) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={3} position={position}>
      <meshStandardMaterial color={color} {...SHELL} />
      <Edges color="#ffd2b5" threshold={15} />
    </RoundedBox>
  );
}

function Cable({ points, color = CYAN }: { points: [number, number, number][]; color?: string }) {
  return <Line points={points} color={color} transparent opacity={0.72} lineWidth={1.4} />;
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
      const targetRotY = pointer.current.x * 0.3;
      const targetRotX = -pointer.current.y * 0.14;
      group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.06;
      group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.06;
    }
    if (bodyGroup.current) {
      const bob = Math.sin(t * 1.1);
      bodyGroup.current.position.y = bob * 0.045;
      bodyGroup.current.rotation.z = Math.sin(t * 0.7) * 0.012;
    }
    if (leftArm.current) {
      leftArm.current.rotation.z = 0.12 + Math.sin(t * 1.1) * 0.035;
      leftArm.current.rotation.x = Math.sin(t * 0.8) * 0.025;
    }
    if (rightArm.current) {
      rightArm.current.rotation.z = -0.12 - Math.sin(t * 1.1 + 0.5) * 0.035;
      rightArm.current.rotation.x = -Math.sin(t * 0.8 + 0.5) * 0.025;
    }

    nextBlink.current -= delta;
    if (nextBlink.current < 0.12 && nextBlink.current > 0) {
      const scale = 1 - Math.sin(((0.12 - nextBlink.current) / 0.12) * Math.PI) * 0.92;
      if (eyelidL.current) eyelidL.current.scale.y = scale;
      if (eyelidR.current) eyelidR.current.scale.y = scale;
    } else if (nextBlink.current <= 0) {
      if (eyelidL.current) eyelidL.current.scale.y = 1;
      if (eyelidR.current) eyelidR.current.scale.y = 1;
      nextBlink.current = 2.5 + Math.random() * 3;
    }
  });

  return (
    <group ref={group}>
      <group ref={bodyGroup}>
        <group position={[0, 1.04, 0]}>
          <Panel args={[0.78, 0.58, 0.6]} color={SHELL_LIGHT} radius={0.11} />
          <Panel args={[0.56, 0.36, 0.06]} position={[0, -0.01, 0.32]} color="#111522" radius={0.04} />
          <mesh position={[0, -0.01, 0.355]}>
            <planeGeometry args={[0.46, 0.27]} />
            <meshBasicMaterial map={faceTexture} toneMapped={false} />
          </mesh>
          <mesh ref={eyelidL} position={[-0.12, 0.05, 0.37]}>
            <circleGeometry args={[0.034, 16]} />
            <meshBasicMaterial color="#fff1e6" toneMapped={false} />
          </mesh>
          <mesh ref={eyelidR} position={[0.12, 0.05, 0.37]}>
            <circleGeometry args={[0.034, 16]} />
            <meshBasicMaterial color="#fff1e6" toneMapped={false} />
          </mesh>
          <mesh position={[-0.29, -0.09, 0.34]}>
            <circleGeometry args={[0.035, 16]} />
            <meshBasicMaterial color="#ffb28e" transparent opacity={0.58} toneMapped={false} />
          </mesh>
          <mesh position={[0.29, -0.09, 0.34]}>
            <circleGeometry args={[0.035, 16]} />
            <meshBasicMaterial color="#ffb28e" transparent opacity={0.58} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.16, 10]} />
            <meshStandardMaterial color={GRAPHITE_LIGHT} {...SHELL} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <mesh position={[-0.43, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.1, 0.018, 8, 20]} />
            <meshStandardMaterial color={GRAPHITE_LIGHT} {...SHELL} />
          </mesh>
          <mesh position={[0.43, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.1, 0.018, 8, 20]} />
            <meshStandardMaterial color={GRAPHITE_LIGHT} {...SHELL} />
          </mesh>
        </group>

        <Joint position={[0, 0.69, 0]} scale={0.9} />

        <group position={[0, 0.26, 0]}>
          <Panel args={[0.9, 0.68, 0.52]} color={SHELL_DARK} radius={0.1} />
          <Panel args={[0.52, 0.44, 0.07]} position={[0, 0.02, 0.3]} color="#111522" radius={0.05} />
          <group position={[0, 0.03, 0.36]} scale={1.12}>
            <CoreNode />
          </group>
          <Panel args={[0.11, 0.25, 0.04]} position={[-0.31, 0.12, 0.31]} color={GRAPHITE_LIGHT} radius={0.02} />
          <Panel args={[0.11, 0.25, 0.04]} position={[0.31, 0.12, 0.31]} color={GRAPHITE_LIGHT} radius={0.02} />
          <mesh position={[0, -0.22, 0.31]}>
            <boxGeometry args={[0.28, 0.025, 0.02]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0.75} toneMapped={false} />
          </mesh>
        </group>

        <Joint position={[0, -0.13, 0]} scale={0.95} />

        <group ref={leftArm} position={[-0.5, 0.48, 0]}>
          <Joint position={[0, 0, 0]} scale={1.05} />
          <Panel args={[0.22, 0.36, 0.22]} position={[0, -0.24, 0]} color={SHELL_LIGHT} radius={0.05} />
          <Joint position={[0, -0.47, 0]} />
          <Panel args={[0.2, 0.38, 0.2]} position={[0, -0.7, 0]} color={SHELL_LIGHT} radius={0.045} />
          <Joint position={[0, -0.94, 0]} scale={0.82} />
          <Panel args={[0.24, 0.12, 0.22]} position={[0, -1.05, 0.01]} color={GRAPHITE_LIGHT} radius={0.03} />
          <mesh position={[0, -1.14, 0.06]}>
            <boxGeometry args={[0.08, 0.12, 0.12]} />
            <meshStandardMaterial color={SHELL_LIGHT} {...SHELL} />
          </mesh>
        </group>
        <group ref={rightArm} position={[0.5, 0.48, 0]}>
          <Joint position={[0, 0, 0]} scale={1.05} />
          <Panel args={[0.22, 0.36, 0.22]} position={[0, -0.24, 0]} color={SHELL_LIGHT} radius={0.05} />
          <Joint position={[0, -0.47, 0]} />
          <Panel args={[0.2, 0.38, 0.2]} position={[0, -0.7, 0]} color={SHELL_LIGHT} radius={0.045} />
          <Joint position={[0, -0.94, 0]} scale={0.82} />
          <Panel args={[0.24, 0.12, 0.22]} position={[0, -1.05, 0.01]} color={GRAPHITE_LIGHT} radius={0.03} />
          <mesh position={[0, -1.14, 0.06]}>
            <boxGeometry args={[0.08, 0.12, 0.12]} />
            <meshStandardMaterial color={SHELL_LIGHT} {...SHELL} />
          </mesh>
        </group>

        <group position={[-0.24, -0.28, 0]}>
          <Joint position={[0, 0, 0]} scale={0.85} />
          <Panel args={[0.24, 0.32, 0.26]} position={[0, -0.2, 0]} color={SHELL_DARK} radius={0.045} />
          <Joint position={[0, -0.42, 0]} scale={0.78} />
          <Panel args={[0.22, 0.34, 0.24]} position={[0, -0.64, 0]} color={GRAPHITE_LIGHT} radius={0.04} />
          <Panel args={[0.3, 0.13, 0.4]} position={[0, -0.84, 0.07]} color={GRAPHITE} radius={0.035} />
        </group>
        <group position={[0.24, -0.28, 0]}>
          <Joint position={[0, 0, 0]} scale={0.85} />
          <Panel args={[0.24, 0.32, 0.26]} position={[0, -0.2, 0]} color={SHELL_DARK} radius={0.045} />
          <Joint position={[0, -0.42, 0]} scale={0.78} />
          <Panel args={[0.22, 0.34, 0.24]} position={[0, -0.64, 0]} color={GRAPHITE_LIGHT} radius={0.04} />
          <Panel args={[0.3, 0.13, 0.4]} position={[0, -0.84, 0.07]} color={GRAPHITE} radius={0.035} />
        </group>

        <Panel args={[0.46, 0.38, 0.16]} position={[0, 0.2, -0.28]} color={GRAPHITE} radius={0.04} />
        <Cable points={[[-0.35, 0.52, 0.23], [-0.58, 0.25, 0.23], [-0.53, -0.02, 0.2]]} color={CYAN} />
        <Cable points={[[0.35, 0.52, 0.23], [0.58, 0.25, 0.23], [0.53, -0.02, 0.2]]} color="#ffb27f" />
        <Cable points={[[-0.22, -0.03, 0.2], [-0.19, -0.26, 0.2]]} color="#ffb27f" />
        <Cable points={[[0.22, -0.03, 0.2], [0.19, -0.26, 0.2]]} color="#ffb27f" />
      </group>
    </group>
  );
}
