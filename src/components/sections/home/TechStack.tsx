import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { skillGroups } from "@/content/skills";
import type { Locale } from "@/i18n/routing";

export function TechStack() {
  const t = useTranslations("Stack");
  const locale = useLocale() as Locale;
  const all = skillGroups.flatMap((g) => g.items);

  return (
    <section aria-label={t("title")} className="py-20 md:py-32">
      <div className="container-page">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        <Reveal stagger={0.08} className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group) => (
            <div key={group.title.en} className="bg-bg p-6 md:p-8">
              <h3 className="mb-4 font-mono text-xs tracking-wider text-accent uppercase">{group.title[locale]}</h3>
              <ul className="grid gap-2">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>

      <div className="relative mt-16 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]" aria-hidden="true">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-12 font-display text-5xl font-semibold whitespace-nowrap text-fg/10 md:text-7xl">
          {[...all, ...all].map((item, i) => (
            <span key={`${item}-${i}`}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
