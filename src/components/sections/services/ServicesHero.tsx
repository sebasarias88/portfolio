"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { ArrowIcon, Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";
import { onPreloaderDone } from "@/lib/preloader";

export function ServicesHero() {
  const t = useTranslations("Services");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.from("[data-fade]", { y: 24, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, delay: 0.3, paused: true });
        return onPreloaderDone(() => tween.play());
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative flex min-h-[85svh] items-end overflow-hidden pt-32 pb-16 md:pb-24">
      <div className="glow pointer-events-none absolute top-0 left-[-10%] size-[44rem] opacity-60" aria-hidden="true" />
      <div className="container-page relative">
        <p data-fade className="mb-6 font-mono text-xs tracking-[0.25em] text-accent uppercase">{t("eyebrow")}</p>
        <SplitHeading as="h1" immediate text={t("title")} className="max-w-5xl text-[clamp(2.75rem,8vw,7rem)] leading-[0.95] font-semibold" />
        <p data-fade className="mt-8 max-w-2xl text-lg text-fg-muted md:text-xl">{t("subtitle")}</p>
        <div data-fade className="mt-10 flex flex-wrap gap-3">
          <Magnetic>
            <Button href="/services#quote">
              {t("cta")} <ArrowIcon />
            </Button>
          </Magnetic>
          <Button href="/#work" variant="secondary">
            {t("seeWork")}
          </Button>
        </div>
      </div>
    </section>
  );
}
