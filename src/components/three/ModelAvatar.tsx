"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type * as THREE from "three";

interface ModelAvatarProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/** Real avatar (GLB, Draco/meshopt friendly). Plays its first animation clip (e.g. typing idle). */
export function ModelAvatar({ url, position = [0, 0, 0.5], rotation = [0, Math.PI, 0], scale = 1 }: ModelAvatarProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    const first = names.at(0);
    if (!first) return;
    actions[first]?.reset().fadeIn(0.4).play();
  }, [actions, names]);

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}
