"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SceneTheme } from "./sceneTheme";

const LINES = [
  "export default async function Portfolio() {",
  "  const projects = await getProjects();",
  "  return (",
  "    <Hero name=\"Sebastián Arias\" />",
  "    <Work items={projects} />",
  "  );",
  "}",
  "",
  "@Injectable()",
  "export class LeadsService {",
  "  constructor(private db: Database) {}",
  "  async create(dto: CreateLeadDto) {",
  "    return this.db.leads.insert(dto);",
  "  }",
  "}",
  "",
  "gsap.to(camera, { z: 0.4, scrub: true });",
  "const supabase = createClient(url, key);",
];

const W = 1024;
const H = 640;

interface ScreenResources {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
}

function createResources(): ScreenResources | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { canvas, texture };
}

/** Paints the editor with the first `shown` characters typed. */
function paint({ canvas, texture }: ScreenResources, theme: SceneTheme, shown: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = theme.screen;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, 0, W, 44);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(28 + i * 26, 22, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.font = "26px ui-monospace, Menlo, monospace";
  let remaining = shown;
  LINES.forEach((line, i) => {
    if (remaining < 0) return;
    const visible = line.slice(0, Math.max(0, remaining));
    remaining -= line.length + 1;
    const y = 92 + i * 30;
    if (y > H - 10) return;
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillText(String(i + 1).padStart(2, " "), 20, y);
    ctx.fillStyle = theme.code.at(i % theme.code.length) ?? "#fff";
    ctx.fillText(visible, 76, y);
  });
  texture.needsUpdate = true;
}

const TOTAL_CHARS = LINES.join("\n").length;

/** Monitor screen: a canvas texture with code that types itself line by line. */
export function CodeScreen({ theme, width, height }: { theme: SceneTheme; width: number; height: number }) {
  const [resources] = useState(createResources);
  const state = useRef({ progress: 0, last: -1 });

  useEffect(() => () => resources?.texture.dispose(), [resources]);

  useFrame((_, delta) => {
    if (!resources) return;
    const s = state.current;
    s.progress = (s.progress + delta * 22) % (TOTAL_CHARS + 60);
    const shown = Math.floor(s.progress);
    if (shown === s.last) return;
    s.last = shown;
    paint(resources, theme, shown);
  });

  if (!resources) return null;
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={resources.texture} toneMapped={false} />
    </mesh>
  );
}
