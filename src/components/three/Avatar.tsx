"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneTheme } from "./sceneTheme";

const SKIN = "#c98e6b";
const HAIR = "#121014";

/** Procedural ink texture standing in for the right-arm tattoo sleeve. */
function useSleeveTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = SKIN;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(30,26,34,0.75)";
    ctx.lineCap = "round";
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      ctx.lineWidth = 1 + rand() * 4;
      ctx.beginPath();
      const x = rand() * 256;
      const y = rand() * 256;
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + rand() * 60 - 30, y + rand() * 60 - 30, x + rand() * 60 - 30, y + rand() * 60 - 30, x + rand() * 80 - 40, y + rand() * 80 - 40);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

interface AvatarProps {
  theme: SceneTheme;
  pointer: React.RefObject<{ x: number; y: number }>;
}

/**
 * Stylized stand-in avatar (curly dark hair, fade, ear plug, black tee,
 * tattooed right arm) seated and typing. Replaced by a real GLB model
 * once `siteConfig.avatarModel` points to one.
 */
export function ProceduralAvatar({ theme, pointer }: AvatarProps) {
  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const leftForearm = useRef<THREE.Group>(null);
  const rightForearm = useRef<THREE.Group>(null);
  const sleeve = useSleeveTexture();

  const skin = useMemo(() => new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6 }), []);
  const inked = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", map: sleeve ?? undefined, roughness: 0.6 }),
    [sleeve],
  );
  const hair = useMemo(() => new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.9 }), []);
  const shirt = useMemo(() => new THREE.MeshStandardMaterial({ color: theme.shirt, roughness: 0.85 }), [theme.shirt]);
  const pants = useMemo(() => new THREE.MeshStandardMaterial({ color: theme.pants, roughness: 0.9 }), [theme.pants]);

  // Curly hair: a deterministic cluster of small spheres on top of the head
  const curls = useMemo(() => {
    const out: [number, number, number, number][] = [];
    let seed = 3;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = rand() * 0.85;
      const r = 0.205;
      out.push([Math.sin(phi) * Math.cos(theta) * r, Math.cos(phi) * r + 0.03, Math.sin(phi) * Math.sin(theta) * r + 0.02, 0.055 + rand() * 0.03]);
    }
    return out;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = pointer.current ?? { x: 0, y: 0 };
    if (head.current) {
      // Glances toward the cursor, then back to the screen
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, p.x * 0.5, 0.05);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -0.08 + p.y * 0.12 + Math.sin(t * 1.3) * 0.015, 0.05);
    }
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 1.6) * 0.008;
    if (leftForearm.current) leftForearm.current.rotation.x = 1.35 + Math.sin(t * 14) * 0.035;
    if (rightForearm.current) rightForearm.current.rotation.x = 1.35 + Math.sin(t * 13 + 1.7) * 0.035;
  });

  return (
    // Seated, facing the monitor (-z)
    <group position={[0, 0, 0.5]}>
      {/* Legs */}
      <mesh material={pants} position={[-0.13, 0.55, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.085, 0.36, 6, 12]} />
      </mesh>
      <mesh material={pants} position={[0.13, 0.55, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.085, 0.36, 6, 12]} />
      </mesh>
      <mesh material={pants} position={[-0.13, 0.3, -0.44]}>
        <capsuleGeometry args={[0.075, 0.38, 6, 12]} />
      </mesh>
      <mesh material={pants} position={[0.13, 0.3, -0.44]}>
        <capsuleGeometry args={[0.075, 0.38, 6, 12]} />
      </mesh>

      <group ref={torso} position={[0, 0.98, 0.02]}>
        {/* Broad, athletic torso in a black tee */}
        <mesh material={shirt} scale={[1.3, 1, 0.85]}>
          <capsuleGeometry args={[0.2, 0.34, 8, 16]} />
        </mesh>
        {/* Neck */}
        <mesh material={skin} position={[0, 0.33, 0]}>
          <cylinderGeometry args={[0.07, 0.085, 0.14, 16]} />
        </mesh>

        {/* Head */}
        <group ref={head} position={[0, 0.52, 0]}>
          <mesh material={skin} scale={[0.92, 1.05, 0.98]}>
            <sphereGeometry args={[0.18, 32, 32]} />
          </mesh>
          {/* Ears + black plug (left) */}
          <mesh material={skin} position={[-0.17, 0, 0.01]} scale={[0.4, 0.7, 0.5]}>
            <sphereGeometry args={[0.06, 12, 12]} />
          </mesh>
          <mesh material={skin} position={[0.17, 0, 0.01]} scale={[0.4, 0.7, 0.5]}>
            <sphereGeometry args={[0.06, 12, 12]} />
          </mesh>
          <mesh position={[0.188, -0.025, 0.01]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.012, 12]} />
            <meshStandardMaterial color="#050505" roughness={0.3} />
          </mesh>
          {/* Low fade: short dark tint on the sides and back */}
          <mesh scale={[0.93, 1.06, 0.99]}>
            <sphereGeometry args={[0.183, 32, 16, 0, Math.PI * 2, Math.PI * 0.18, Math.PI * 0.3]} />
            <meshStandardMaterial color="#4a3630" roughness={1} />
          </mesh>
          {/* Curly top */}
          <mesh material={hair} position={[0, 0.035, 0.01]} scale={[0.95, 0.75, 1]}>
            <sphereGeometry args={[0.19, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          </mesh>
          {curls.map(([x, y, z, r], i) => (
            <mesh key={i} material={hair} position={[x * 0.9, y + 0.02, z * 0.95 - 0.01]}>
              <sphereGeometry args={[r * 0.6, 8, 8]} />
            </mesh>
          ))}
        </group>

        {/* Left arm (plain) */}
        <group position={[-0.31, 0.16, 0]} rotation={[0.35, 0, 0.12]}>
          <mesh material={shirt} position={[0, -0.04, 0]}>
            <capsuleGeometry args={[0.085, 0.08, 6, 12]} />
          </mesh>
          <mesh material={skin} position={[0, -0.17, 0]}>
            <capsuleGeometry args={[0.078, 0.16, 6, 12]} />
          </mesh>
          <group ref={leftForearm} position={[0, -0.3, 0]}>
            <mesh material={skin} position={[0, -0.13, 0]}>
              <capsuleGeometry args={[0.062, 0.2, 6, 12]} />
            </mesh>
            <mesh material={skin} position={[0, -0.28, 0]}>
              <sphereGeometry args={[0.055, 12, 12]} />
            </mesh>
          </group>
        </group>

        {/* Right arm (tattoo sleeve) */}
        <group position={[0.31, 0.16, 0]} rotation={[0.35, 0, -0.12]}>
          <mesh material={shirt} position={[0, -0.04, 0]}>
            <capsuleGeometry args={[0.085, 0.08, 6, 12]} />
          </mesh>
          <mesh material={inked} position={[0, -0.17, 0]}>
            <capsuleGeometry args={[0.078, 0.16, 6, 12]} />
          </mesh>
          <group ref={rightForearm} position={[0, -0.3, 0]}>
            <mesh material={inked} position={[0, -0.13, 0]}>
              <capsuleGeometry args={[0.062, 0.2, 6, 12]} />
            </mesh>
            <mesh material={skin} position={[0, -0.28, 0]}>
              <sphereGeometry args={[0.055, 12, 12]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
