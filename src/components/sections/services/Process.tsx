import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { processSteps } from "@/content/services";
import type { Locale } from "@/i18n/routing";

export function Process() {
  const t = useTranslations("Services");
  const locale = useLocale() as Locale;

  return (
    <section className="container-page py-20 md:py-32">
      <SectionHeading eyebrow={t("processEyebrow")} title={t("processTitle")} />
      <Reveal as="ol" stagger={0.1} className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
        {processSteps.map((step, i) => (
          <li key={step.title.en} className="bg-bg p-6 md:p-8">
            <span className="font-mono text-sm text-accent">0{i + 1}</span>
            <h3 className="mt-6 font-display text-2xl font-semibold">{step.title[locale]}</h3>
            <p className="mt-2 text-sm text-fg-muted">{step.description[locale]}</p>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
