"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onPreloaderDone } from "@/lib/preloader";
import { cn } from "@/lib/utils";

interface SplitHeadingProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Run on mount instead of on scroll (used in the hero) */
  immediate?: boolean;
  delay?: number;
}

/** Heading whose lines slide up from a mask, Apple-keynote style. */
export function SplitHeading({ text, as = "h2", className, immediate = false, delay = 0 }: SplitHeadingProps) {
  const Tag = as as "h2";
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(el, { type: "lines,words", mask: "lines", linesClass: "pb-[0.08em]" });
        const tween = gsap.from(split.words, {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.035,
          delay,
          paused: immediate,
          scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
        });
        const stop = immediate ? onPreloaderDone(() => tween.play()) : undefined;
        return () => {
          stop?.();
          split.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn("font-display tracking-tight text-balance", className)}>
      {text}
    </Tag>
  );
}
