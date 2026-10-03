"use client";

import { RoundedBox } from "@react-three/drei";
import { CodeScreen } from "./CodeScreen";
import type { SceneTheme } from "./sceneTheme";

// 16:10 panel to match the editor canvas (1600×1000)
export const MONITOR = { position: [0, 1.25, -0.5] as const, width: 1.1, height: 0.6875 };

/** Desk, monitor, keyboard, chair and small personal props. */
export function Workspace({ theme }: { theme: SceneTheme }) {
  return (
    <group>
      {/* Desk */}
      <RoundedBox args={[2.2, 0.05, 0.9]} radius={0.02} position={[0, 0.75, -0.25]}>
        <meshStandardMaterial color={theme.desk} roughness={0.55} />
      </RoundedBox>
      {[-1.02, 1.02].map((x) => (
        <mesh key={x} position={[x, 0.37, -0.25]}>
          <boxGeometry args={[0.05, 0.74, 0.8]} />
          <meshStandardMaterial color={theme.deskEdge} roughness={0.6} />
        </mesh>
      ))}
      {/* Accent light strip under the desk */}
      <mesh position={[0, 0.715, 0.19]}>
        <boxGeometry args={[2.0, 0.01, 0.01]} />
        <meshBasicMaterial color={theme.accent} toneMapped={false} />
      </mesh>

      {/* Monitor */}
      <group position={MONITOR.position}>
        <RoundedBox args={[MONITOR.width + 0.06, MONITOR.height + 0.06, 0.04]} radius={0.015} position={[0, 0, -0.025]}>
          <meshStandardMaterial color="#0b0a0e" roughness={0.4} metalness={0.3} />
        </RoundedBox>
        <group position={[0, 0, 0.001]}>
          <CodeScreen theme={theme} width={MONITOR.width} height={MONITOR.height} />
        </group>
        <mesh position={[0, -MONITOR.height / 2 - 0.06, -0.06]}>
          <boxGeometry args={[0.05, 0.16, 0.04]} />
          <meshStandardMaterial color={theme.metal} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, -MONITOR.height / 2 - 0.13, -0.03]}>
          <boxGeometry args={[0.3, 0.015, 0.18]} />
          <meshStandardMaterial color={theme.metal} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Keyboard with soft backlight */}
      <RoundedBox args={[0.5, 0.02, 0.16]} radius={0.008} position={[0, 0.785, -0.02]}>
        <meshStandardMaterial color="#141218" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.796, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.46, 0.12]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={0.25} toneMapped={false} />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.38, 0.79, -0.02]} scale={[1, 0.5, 1.4]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#141218" roughness={0.4} />
      </mesh>

      {/* Mug */}
      <mesh position={[-0.62, 0.83, -0.2]}>
        <cylinderGeometry args={[0.045, 0.04, 0.11, 24]} />
        <meshStandardMaterial color={theme.accent} roughness={0.35} />
      </mesh>

      {/* Plant */}
      <group position={[0.85, 0.78, -0.45]}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.07, 0.055, 0.14, 24]} />
          <meshStandardMaterial color={theme.deskEdge} roughness={0.8} />
        </mesh>
        {[
          [0, 0.24, 0, 0.09],
          [0.06, 0.2, 0.03, 0.07],
          [-0.05, 0.21, -0.03, 0.07],
          [0.01, 0.31, 0.01, 0.06],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <icosahedronGeometry args={[r, 1]} />
            <meshStandardMaterial color="#3f7d5c" roughness={0.8} flatShading />
          </mesh>
        ))}
      </group>

      {/* Gaming chair (black with red accents) */}
      <group position={[0, 0, 0.78]}>
        <RoundedBox args={[0.55, 0.08, 0.5]} radius={0.03} position={[0, 0.48, 0]}>
          <meshStandardMaterial color={theme.chair} roughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.52, 0.8, 0.08]} radius={0.04} position={[0, 0.9, 0.25]} rotation={[-0.12, 0, 0]}>
          <meshStandardMaterial color={theme.chair} roughness={0.6} />
        </RoundedBox>
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, 0.9, 0.205]} rotation={[-0.12, 0, 0]}>
            <boxGeometry args={[0.03, 0.7, 0.005]} />
            <meshStandardMaterial color="#b3202a" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.42, 12]} />
          <meshStandardMaterial color={theme.metal} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Dumbbell on the floor — a nod to the gym */}
      <group position={[-0.75, 0.06, 0.45]} rotation={[0, 0.6, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.36, 12]} />
          <meshStandardMaterial color={theme.metal} metalness={0.7} roughness={0.3} />
        </mesh>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.06, 8]} />
            <meshStandardMaterial color="#1a181f" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
