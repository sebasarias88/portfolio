import { useLocale, useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/content/services";
import type { Locale } from "@/i18n/routing";

export function Faq() {
  const t = useTranslations("Services");
  const locale = useLocale() as Locale;

  return (
    <section id="faq" className="container-page scroll-mt-24 py-20 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.5fr]">
        <SectionHeading eyebrow={t("faqEyebrow")} title={t("faqTitle")} className="md:mb-0" />
        <div className="border-t border-border">
          {faqs.map((faq) => (
            <details key={faq.question.en} className="group border-b border-border py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {faq.question[locale]}
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-fg-muted">{faq.answer[locale]}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
