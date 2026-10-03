"use client";

import { ContactShadows } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { siteConfig } from "@/config/site";
import { ProceduralAvatar } from "./Avatar";
import { ModelAvatar } from "./ModelAvatar";
import { sceneTheme } from "./sceneTheme";
import { MONITOR, Workspace } from "./Workspace";

interface HeroSceneProps {
  /** 0 → 1 scroll progress of the hero: camera flies into the monitor. */
  progress: React.RefObject<number>;
}

const START_POS = new THREE.Vector3(3.3, 2.35, 3.4);
// Aimed left of the desk so the scene sits on the right, beside the copy
const START_TARGET = new THREE.Vector3(-1.05, 0.95, 0.15);
const END_POS = new THREE.Vector3(MONITOR.position[0], MONITOR.position[1], MONITOR.position[2] + 0.62);
const END_TARGET = new THREE.Vector3(...MONITOR.position);

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function CameraRig({ progress, pointer }: HeroSceneProps & { pointer: React.RefObject<{ x: number; y: number }> }) {
  const camera = useThree((s) => s.camera);
  const pos = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    const t = ease(THREE.MathUtils.clamp(progress.current ?? 0, 0, 1));
    const p = pointer.current ?? { x: 0, y: 0 };
    const parallax = 1 - t; // mouse parallax fades out as we dive into the screen
    pos.current.lerpVectors(START_POS, END_POS, t);
    pos.current.x += p.x * 0.35 * parallax;
    pos.current.y += p.y * 0.2 * parallax;
    target.current.lerpVectors(START_TARGET, END_TARGET, t);
    camera.position.lerp(pos.current, 0.12);
    camera.lookAt(target.current);
  });

  return null;
}

/** Hero 3D scene: Sebastián's desk; scrolling dives the camera into the monitor. */
export default function HeroScene({ progress }: HeroSceneProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? sceneTheme.light : sceneTheme.dark;
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1) };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: START_POS.toArray(), fov: 35, near: 0.05, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <ambientLight intensity={theme.ambient} />
      <directionalLight position={[3, 5, 3]} intensity={theme.key} />
      <pointLight position={[0, 1.3, -0.9]} intensity={2.2} distance={3} color={theme.accent} />
      <pointLight position={[-1.6, 1.6, 1.2]} intensity={0.8} distance={5} color="#ffd9b8" />

      <Suspense fallback={null}>
        <Workspace theme={theme} />
        {siteConfig.avatarModel ? (
          <ModelAvatar url={siteConfig.avatarModel} />
        ) : (
          <ProceduralAvatar theme={theme} pointer={pointer} />
        )}
        <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={6} blur={2.4} far={2} resolution={512} />
      </Suspense>

      <CameraRig progress={progress} pointer={pointer} />
    </Canvas>
  );
}
