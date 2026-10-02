"use client";

import { useRef, useState } from "react";
import { Monogram } from "@/components/ui/Monogram";
import { gsap, useGSAP } from "@/lib/gsap";
import { markPreloaderDone } from "@/lib/preloader";

const SESSION_KEY = "sa-preloader-seen";

function hasSeenPreloader() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markPreloaderSeen() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage unavailable — show it again next time */
  }
}

/** Draws the SA monogram with a 0→100 counter, once per session. */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || hasSeenPreloader()) {
        setDone(true);
        markPreloaderDone();
        return;
      }

      document.documentElement.style.overflow = "hidden";
      const state = { p: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          markPreloaderSeen();
          document.documentElement.style.overflow = "";
          setDone(true);
        },
      });
      // Start page intro animations while the curtain lifts
      tl.call(markPreloaderDone, undefined, 2.0);

      tl.fromTo("[data-draw]", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: 0.15 })
        .to(state, {
          p: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(state.p)).padStart(3, "0");
          },
        }, 0)
        .to(el, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "+=0.15");

      return () => {
        document.documentElement.style.overflow = "";
      };
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[90] grid place-items-center bg-bg" aria-hidden="true">
      <Monogram drawable className="size-20 text-fg" />
      <span ref={counter} className="absolute right-6 bottom-6 font-mono text-sm text-fg-muted md:right-10 md:bottom-10">
        000
      </span>
    </div>
  );
}
