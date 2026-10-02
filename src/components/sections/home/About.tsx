"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

/** Words light up one by one as you scroll — Apple product-page style. */
export function About() {
  const t = useTranslations("About");
  const locale = useLocale() as Locale;
  const root = useRef<HTMLElement>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create("[data-scrub-text]", { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.15 },
          {
            opacity: 1,
            stagger: 0.05,
            ease: "none",
            scrollTrigger: { trigger: "[data-scrub-text]", start: "top 80%", end: "bottom 45%", scrub: true },
          },
        );
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale] },
  );

  return (
    <section id="about" ref={root} className="container-page scroll-mt-24 py-20 md:py-32">
      <p className="mb-4 font-mono text-xs tracking-[0.2em] text-accent uppercase">{t("eyebrow")}</p>
      <div className="grid gap-12 md:grid-cols-[1fr_20rem] md:gap-16">
        <div data-scrub-text className="space-y-8 font-display text-2xl leading-snug font-medium md:text-4xl">
          {profile.about[locale].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-bg-elevated">
          {profile.photo && !photoFailed ? (
            <Image
              src={profile.photo}
              alt={profile.name}
              fill
              sizes="(min-width: 768px) 20rem, 100vw"
              className="object-cover"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--accent-soft),transparent_70%)]">
              <span className="font-display text-7xl font-semibold text-accent/60">SA</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
