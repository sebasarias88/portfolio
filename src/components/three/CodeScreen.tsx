"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SceneTheme } from "./sceneTheme";

/* ------------------------------------------------------------------ */
/* Content: files the "editor" types, one after another                */
/* ------------------------------------------------------------------ */

interface EditorFile {
  name: string;
  path: string[];
  lang: string;
  lines: string[];
}

const FILES: EditorFile[] = [
  {
    name: "page.tsx",
    path: ["src", "app", "[locale]"],
    lang: "TypeScript React",
    lines: [
      'import { Hero } from "@/components/sections/home/Hero";',
      'import { getProjects } from "@/lib/projects";',
      "",
      "export default async function Portfolio() {",
      "  const projects = await getProjects();",
      "",
      "  return (",
      "    <main>",
      '      <Hero name="Sebastián Arias" role="Full Stack" />',
      "      <Work items={projects} />",
      "      <Contact />",
      "    </main>",
      "  );",
      "}",
    ],
  },
  {
    name: "leads.service.ts",
    path: ["api", "src", "leads"],
    lang: "TypeScript",
    lines: [
      'import { Injectable } from "@nestjs/common";',
      "",
      "@Injectable()",
      "export class LeadsService {",
      "  constructor(private readonly db: DatabaseService) {}",
      "",
      "  // Store the lead and notify on WhatsApp",
      "  async create(dto: CreateLeadDto) {",
      "    const lead = await this.db.leads.insert(dto);",
      "    await this.notifier.send(lead);",
      "    return lead;",
      "  }",
      "}",
    ],
  },
  {
    name: "hero.animation.ts",
    path: ["src", "lib"],
    lang: "TypeScript",
    lines: [
      'import { gsap, ScrollTrigger } from "gsap/all";',
      "",
      "export function diveIntoScreen(camera: Camera) {",
      "  return gsap.timeline({",
      '    scrollTrigger: { trigger: "#hero", scrub: true },',
      "  })",
      "    .to(camera.position, { z: 0.4, ease: \"none\" })",
      '    .to(".copy", { autoAlpha: 0 }, 0);',
      "}",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Syntax highlighting (tiny tokenizer, good enough for a backdrop)     */
/* ------------------------------------------------------------------ */

type TokenKind = "keyword" | "string" | "comment" | "type" | "fn" | "punct" | "text" | "decorator";

const KEYWORDS = new Set([
  "import", "from", "export", "default", "async", "function", "const", "return", "await",
  "class", "private", "readonly", "new", "if", "this",
]);

const TOKEN_RE = /(\/\/.*$|"[^"]*"|`[^`]*`|@\w+|\b[A-Za-z_]\w*\b|[{}()[\];<>/=.,:!?]|\s+)/g;

function tokenize(line: string): { text: string; kind: TokenKind }[] {
  const out: { text: string; kind: TokenKind }[] = [];
  for (const match of line.matchAll(TOKEN_RE)) {
    const text = match[0];
    const next = line[(match.index ?? 0) + text.length];
    let kind: TokenKind = "text";
    if (text.startsWith("//")) kind = "comment";
    else if (text.startsWith('"') || text.startsWith("`")) kind = "string";
    else if (text.startsWith("@")) kind = "decorator";
    else if (KEYWORDS.has(text)) kind = "keyword";
    else if (/^[A-Z]/.test(text)) kind = "type";
    else if (/^[a-z_]\w*$/i.test(text) && next === "(") kind = "fn";
    else if (/^[{}()[\];<>/=.,:!?]$/.test(text)) kind = "punct";
    out.push({ text, kind });
  }
  return out;
}

const PALETTE: Record<TokenKind, string> = {
  keyword: "#b4a6ff",
  string: "#86e1b0",
  comment: "#6c6680",
  type: "#f0c987",
  fn: "#7fd0ff",
  punct: "#8f89a6",
  text: "#e6e3f0",
  decorator: "#f29fc5",
};

/* ------------------------------------------------------------------ */
/* Canvas painting                                                     */
/* ------------------------------------------------------------------ */

const W = 1600;
const H = 1000;
const TITLE_H = 52;
const ACTIVITY_W = 64;
const SIDEBAR_W = 300;
const TABS_H = 52;
const STATUS_H = 40;
const LINE_H = 44;
const FONT = "30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SMALL = "22px ui-sans-serif, system-ui, -apple-system, sans-serif";

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
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return { canvas, texture };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

interface PaintState {
  fileIndex: number;
  typed: number;
  caretOn: boolean;
}

function paint({ canvas, texture }: ScreenResources, theme: SceneTheme, state: PaintState) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const file = FILES.at(state.fileIndex) ?? FILES[0];
  const accent = theme.accent;

  // Window background
  ctx.fillStyle = "#0d0b12";
  ctx.fillRect(0, 0, W, H);

  // Title bar
  ctx.fillStyle = "#131019";
  ctx.fillRect(0, 0, W, TITLE_H);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(30 + i * 28, TITLE_H / 2, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = SMALL;
  ctx.fillStyle = "#8f89a6";
  ctx.textAlign = "center";
  ctx.fillText("sebastian-arias — portfolio", W / 2, TITLE_H / 2 + 8);
  ctx.textAlign = "left";

  // Activity bar
  ctx.fillStyle = "#100e16";
  ctx.fillRect(0, TITLE_H, ACTIVITY_W, H - TITLE_H - STATUS_H);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 0 ? accent : "#3a3448";
    roundRect(ctx, 18, TITLE_H + 24 + i * 64, 28, 28, 7);
  }
  ctx.fillStyle = accent;
  ctx.fillRect(0, TITLE_H + 20, 4, 36);

  // Sidebar (explorer)
  ctx.fillStyle = "#121018";
  ctx.fillRect(ACTIVITY_W, TITLE_H, SIDEBAR_W, H - TITLE_H - STATUS_H);
  ctx.font = "bold 18px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#6c6680";
  ctx.fillText("EXPLORER", ACTIVITY_W + 24, TITLE_H + 40);
  ctx.font = SMALL;
  const tree: [number, string, boolean][] = [
    [0, "▾ src", false],
    [1, "▾ app", false],
    [2, "▸ [locale]", false],
    [1, "▾ components", false],
    [2, "Hero.tsx", false],
    [2, "ChatWidget.tsx", false],
    [1, "▾ lib", false],
    [2, "hero.animation.ts", false],
    [0, "▾ api", false],
    [1, "leads.service.ts", false],
    [0, "package.json", false],
  ];
  tree.forEach(([depth, label], i) => {
    const y = TITLE_H + 84 + i * 38;
    const active = label === file.name;
    if (active) {
      ctx.fillStyle = "rgba(157,140,255,0.16)";
      ctx.fillRect(ACTIVITY_W, y - 26, SIDEBAR_W, 36);
    }
    ctx.fillStyle = active ? "#ffffff" : label.startsWith("▾") || label.startsWith("▸") ? "#a39db8" : "#8f89a6";
    ctx.fillText(label, ACTIVITY_W + 24 + depth * 20, y);
  });

  // Tabs
  const editorX = ACTIVITY_W + SIDEBAR_W;
  ctx.fillStyle = "#110f17";
  ctx.fillRect(editorX, TITLE_H, W - editorX, TABS_H);
  let tabX = editorX;
  FILES.forEach((f, i) => {
    ctx.font = SMALL;
    const w = ctx.measureText(f.name).width + 56;
    const active = i === state.fileIndex;
    ctx.fillStyle = active ? "#0d0b12" : "#110f17";
    ctx.fillRect(tabX, TITLE_H, w, TABS_H);
    if (active) {
      ctx.fillStyle = accent;
      ctx.fillRect(tabX, TITLE_H, w, 3);
    }
    ctx.fillStyle = active ? "#ffffff" : "#6c6680";
    ctx.fillText(f.name, tabX + 28, TITLE_H + 34);
    tabX += w + 1;
  });

  // Breadcrumbs
  ctx.font = "19px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#6c6680";
  ctx.fillText([...file.path, file.name].join("  ›  "), editorX + 28, TITLE_H + TABS_H + 30);

  // Code area
  const codeTop = TITLE_H + TABS_H + 56;
  const gutterX = editorX + 28;
  const codeX = editorX + 100;
  ctx.font = FONT;

  let remaining = state.typed;
  let caret: { x: number; y: number } | null = null;
  let currentLine = 0;

  file.lines.forEach((line, i) => {
    const y = codeTop + i * LINE_H;
    if (y > H - STATUS_H - 20) return;
    const visibleChars = Math.max(0, Math.min(line.length, remaining));
    const isCurrent = remaining >= 0 && remaining <= line.length;
    if (isCurrent) {
      currentLine = i;
      ctx.fillStyle = "rgba(255,255,255,0.035)";
      ctx.fillRect(editorX, y - LINE_H + 12, W - editorX, LINE_H);
    }
    ctx.fillStyle = isCurrent ? "#d6d1e6" : "#4a4458";
    ctx.textAlign = "right";
    ctx.fillText(String(i + 1), gutterX + 44, y);
    ctx.textAlign = "left";

    if (remaining >= 0) {
      let x = codeX;
      let left = visibleChars;
      for (const token of tokenize(line)) {
        if (left <= 0) break;
        const text = token.text.slice(0, left);
        ctx.fillStyle = PALETTE[token.kind];
        ctx.font = token.kind === "comment" ? `italic ${FONT}` : FONT;
        ctx.fillText(text, x, y);
        x += ctx.measureText(text).width;
        left -= token.text.length;
      }
      if (isCurrent) caret = { x, y };
    }
    remaining -= line.length + 1;
  });

  if (caret && state.caretOn) {
    const { x, y } = caret;
    ctx.fillStyle = accent;
    ctx.fillRect(x + 2, y - 30, 3, 38);
  }

  // Minimap
  const mapX = W - 120;
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  ctx.fillRect(mapX, TITLE_H + TABS_H, 120, H - TITLE_H - TABS_H - STATUS_H);
  file.lines.forEach((line, i) => {
    ctx.fillStyle = i % 3 === 0 ? "rgba(180,166,255,0.35)" : "rgba(230,227,240,0.18)";
    ctx.fillRect(mapX + 16 + (line.length - line.trimStart().length) * 2, TITLE_H + TABS_H + 20 + i * 8, Math.min(line.trim().length * 1.6, 88), 4);
  });

  // Status bar
  ctx.fillStyle = accent;
  ctx.fillRect(0, H - STATUS_H, W, STATUS_H);
  ctx.font = "bold 20px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#0d0b12";
  ctx.fillText("⎇ main", 24, H - 12);
  ctx.font = "20px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("✓ 0 problems", 150, H - 12);
  ctx.textAlign = "right";
  ctx.fillText(`Ln ${currentLine + 1}   UTF-8   ${file.lang}   ✓ Prettier`, W - 24, H - 12);
  ctx.textAlign = "left";

  // Soft vignette for depth
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  texture.needsUpdate = true;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CHARS_PER_SECOND = 26;
const HOLD_SECONDS = 2.2;

/** Monitor screen: a premium editor that types real-looking code across several files. */
export function CodeScreen({ theme, width, height }: { theme: SceneTheme; width: number; height: number }) {
  const [resources] = useState(createResources);
  const state = useRef({ fileIndex: 0, progress: 0, hold: 0, signature: "" });

  useEffect(() => () => resources?.texture.dispose(), [resources]);

  useFrame(({ clock }, delta) => {
    if (!resources) return;
    const s = state.current;
    const file = FILES.at(s.fileIndex) ?? FILES[0];
    const total = file.lines.join("\n").length;

    if (s.progress < total) {
      s.progress = Math.min(total, s.progress + delta * CHARS_PER_SECOND);
    } else {
      s.hold += delta;
      if (s.hold > HOLD_SECONDS) {
        s.fileIndex = (s.fileIndex + 1) % FILES.length;
        s.progress = 0;
        s.hold = 0;
      }
    }

    const typed = Math.floor(s.progress);
    const caretOn = Math.floor(clock.elapsedTime * 2) % 2 === 0;
    const signature = `${s.fileIndex}:${typed}:${caretOn}:${theme.accent}`;
    if (signature === s.signature) return;
    s.signature = signature;
    paint(resources, theme, { fileIndex: s.fileIndex, typed, caretOn });
  });

  if (!resources) return null;
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={resources.texture} toneMapped={false} />
    </mesh>
  );
}
