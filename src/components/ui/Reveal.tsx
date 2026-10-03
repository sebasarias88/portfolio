"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  as?: "div" | "section" | "ol" | "ul" | "li" | "dl" | "p";
  className?: string;
  delay?: number;
  /** Animate direct children one after another */
  stagger?: number;
  y?: number;
}

/** Fades and lifts content into view when it enters the viewport. */
export function Reveal({ children, as = "div", className, delay = 0, stagger = 0, y = 32 }: RevealProps) {
  // Narrow to one tag for typing; the rendered element is still `as`
  const Tag = as as "div";
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? Array.from(el.children) : el;
        gsap.from(targets, {
          y,
          autoAlpha: 0,
          duration: 1.1,
          ease: "expo.out",
          delay,
          stagger,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
