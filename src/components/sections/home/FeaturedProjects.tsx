"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredProjects } from "@/content/projects";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ProjectCard } from "./ProjectCard";

/**
 * Stacked sticky cards: each project pins under the header and the previous
 * one scales back and dims as the next slides over it.
 */
export function FeaturedProjects() {
  const t = useTranslations("Work");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-project-card]");
        cards.forEach((card, i) => {
          const next = cards.at(i + 1);
          if (!next) return;
          gsap.to(card, {
            scale: 0.9,
            autoAlpha: 0.35,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 15%", scrub: true },
          });
        });
        ScrollTrigger.refresh();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} className="container-page scroll-mt-24 py-20 md:py-32">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <ol className="flex flex-col gap-8 md:gap-[12vh]">
        {featuredProjects.map((project, i) => (
          <li key={project.slug} className="md:sticky md:top-24">
            <ProjectCard project={project} index={i} total={featuredProjects.length} />
          </li>
        ))}
      </ol>
    </section>
  );
}
