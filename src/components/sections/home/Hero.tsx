"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import { AvailabilityBadge } from "@/components/layout/AvailabilityBadge";
import { ArrowIcon, Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { siteConfig } from "@/config/site";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { gsap, useGSAP } from "@/lib/gsap";
import { onPreloaderDone } from "@/lib/preloader";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  const t = useTranslations("Hero");
  const tc = useTranslations("Common");
  const locale = useLocale() as Locale;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Intro: supporting content fades up after the name
        const intro = gsap.from("[data-hero-fade]", {
          y: 24,
          autoAlpha: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          delay: 0.35,
          paused: true,
        });
        const stop = onPreloaderDone(() => intro.play());

        // Scroll: the hero recedes like an Apple keynote slide
        gsap.to("[data-hero-content]", {
          scale: 0.92,
          autoAlpha: 0,
          yPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });

        return stop;
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative flex min-h-svh items-center overflow-hidden pt-24 pb-16">
      <HeroVisual />

      <div data-hero-content className="container-page relative z-10 origin-top">
        <div data-hero-fade className="mb-8">
          <AvailabilityBadge />
        </div>

        <p data-hero-fade className="mb-4 font-mono text-xs tracking-[0.25em] text-accent uppercase">
          {t("eyebrow")} · {t("years", { count: profile.yearsOfExperience })}
        </p>

        <SplitHeading
          as="h1"
          immediate
          text={profile.name}
          className="text-[clamp(3.25rem,12vw,10.5rem)] leading-[0.9] font-semibold"
        />

        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p data-hero-fade className="font-display text-2xl leading-snug font-medium text-balance md:text-3xl">
              {profile.headline[locale]}
            </p>
            <p data-hero-fade className="mt-4 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg">
              {profile.intro[locale]}
            </p>
          </div>

          <div data-hero-fade className="flex flex-wrap gap-3 md:justify-end">
            <Magnetic>
              <Button href="/#contact">
                {tc("contactMe")} <ArrowIcon />
              </Button>
            </Magnetic>
            <Button external href={siteConfig.resume[locale]} variant="secondary" download>
              {tc("downloadCv")}
            </Button>
          </div>
        </div>
      </div>

      <div data-hero-fade className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-fg-muted" aria-hidden="true">
        <div className="flex flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase">
          {tc("scroll")}
          <span className="relative block h-10 w-px overflow-hidden bg-border">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_1.8s_ease-in-out_infinite] bg-accent" />
          </span>
        </div>
      </div>
    </section>
  );
}
