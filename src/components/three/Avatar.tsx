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
    for (let i = 0; i < 120; i++) {
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

  // Curly hair: deterministic small curls spread over the top of the head
  const curls = useMemo(() => {
    const out: [number, number, number, number][] = [];
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 160; i++) {
      const theta = rand() * Math.PI * 2;
      // Front (-z) curls fall a little lower, like a fringe
      const front = Math.max(0, -Math.sin(theta));
      const phi = Math.sqrt(rand()) * (0.95 + front * 0.25);
      const r = 0.178;
      out.push([
        Math.sin(phi) * Math.cos(theta) * r * 0.93,
        Math.cos(phi) * r + 0.02,
        Math.sin(phi) * Math.sin(theta) * r,
        0.022 + rand() * 0.02,
      ]);
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
          <cylinderGeometry args={[0.08, 0.1, 0.14, 16]} />
        </mesh>

        {/* Head (front faces -z) */}
        <group ref={head} position={[0, 0.52, 0]}>
          {/* Cranium + jaw for a less spherical, more masculine shape */}
          <mesh material={skin} scale={[0.88, 1.06, 0.96]}>
            <sphereGeometry args={[0.17, 32, 32]} />
          </mesh>
          <mesh material={skin} position={[0, -0.075, -0.035]} scale={[0.95, 0.78, 1]}>
            <sphereGeometry args={[0.125, 24, 24]} />
          </mesh>
          {/* Stubble shadow on jaw and upper lip */}
          <mesh position={[0, -0.08, -0.04]} scale={[0.97, 0.8, 1.02]}>
            <sphereGeometry args={[0.127, 24, 24, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55]} />
            <meshStandardMaterial color="#3a2a26" transparent opacity={0.35} roughness={1} />
          </mesh>
          {/* Nose */}
          <mesh material={skin} position={[0, -0.01, -0.165]} scale={[0.8, 1.2, 1]}>
            <sphereGeometry args={[0.028, 16, 16]} />
          </mesh>
          {/* Eyes and brows */}
          {[-0.055, 0.055].map((x) => (
            <group key={x} position={[x, 0.035, -0.142]}>
              <mesh>
                <sphereGeometry args={[0.018, 16, 16]} />
                <meshStandardMaterial color="#f2ece6" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, -0.012]}>
                <sphereGeometry args={[0.01, 12, 12]} />
                <meshStandardMaterial color="#1b1210" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.034, -0.006]} rotation={[0.2, 0, x > 0 ? -0.12 : 0.12]}>
                <boxGeometry args={[0.05, 0.011, 0.012]} />
                <meshStandardMaterial color={HAIR} roughness={1} />
              </mesh>
            </group>
          ))}
          {/* Ears + black plug (right ear, toward camera) */}
          <mesh material={skin} position={[-0.152, 0, 0.01]} scale={[0.4, 0.7, 0.5]}>
            <sphereGeometry args={[0.055, 12, 12]} />
          </mesh>
          <mesh material={skin} position={[0.152, 0, 0.01]} scale={[0.4, 0.7, 0.5]}>
            <sphereGeometry args={[0.055, 12, 12]} />
          </mesh>
          <mesh position={[0.168, -0.022, 0.01]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.013, 0.013, 0.012, 12]} />
            <meshStandardMaterial color="#050505" roughness={0.3} />
          </mesh>
          {/* Hair: dark cap over the top, ending just above the ears (low fade) */}
          <mesh material={hair} position={[0, 0.015, 0.004]} scale={[0.93, 0.98, 1]}>
            <sphereGeometry args={[0.176, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.44]} />
          </mesh>
          {/* Curls sitting on the cap */}
          {curls.map(([x, y, z, r], i) => (
            <mesh key={i} material={hair} position={[x, y, z]}>
              <sphereGeometry args={[r, 8, 8]} />
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
