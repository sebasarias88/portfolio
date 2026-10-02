"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";

interface CounterProps {
  value: number;
  suffix?: string;
  className?: string;
}

/** Number that counts up when scrolled into view. */
export function Counter({ value, suffix = "", className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const locale = useLocale();
  const format = (n: number) => new Intl.NumberFormat(locale === "es" ? "es-CO" : "en-US").format(Math.round(n));

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const state = { n: 0 };
        el.textContent = format(0) + suffix;
        gsap.to(state, {
          n: value,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = format(state.n) + suffix;
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [value, suffix, locale] },
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
      {suffix}
    </span>
  );
}
