"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Ambient hero background: an accent glow that trails the cursor plus a slow
 * rotating ring. Placeholder for the Phase 3 R3F desk scene + avatar, which
 * will mount here behind the same API.
 */
export function HeroVisual() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const glow = root.current?.querySelector<HTMLElement>("[data-glow]");
      if (!glow || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const xTo = gsap.quickTo(glow, "x", { duration: 1.6, ease: "power3.out" });
      const yTo = gsap.quickTo(glow, "y", { duration: 1.6, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        xTo((e.clientX / window.innerWidth - 0.5) * 240);
        yTo((e.clientY / window.innerHeight - 0.5) * 160);
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div data-glow className="glow absolute top-[18%] right-[-10%] size-[46rem] rounded-full opacity-70 md:right-[5%]" />
      <div className="absolute top-1/2 right-[-20%] size-[38rem] -translate-y-1/2 animate-[spin_40s_linear_infinite] rounded-full border border-accent/20 md:right-[2%]">
        <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_24px_var(--accent-glow)]" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] bg-[size:72px_72px] opacity-40" />
    </div>
  );
}
