import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getVisibleTestimonials } from "@/content/testimonials";
import type { Locale } from "@/i18n/routing";

/** Client quotes. Renders nothing when there are no publishable testimonials. */
export function Testimonials() {
  const t = useTranslations("Testimonials");
  const locale = useLocale() as Locale;
  const items = getVisibleTestimonials();
  if (items.length === 0) return null;

  return (
    <section className="container-page py-20 md:py-32">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <Reveal stagger={0.1} className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <figure key={item.author} className="relative flex flex-col justify-between rounded-3xl border border-border bg-bg-elevated p-6 md:p-8">
            {item.placeholder && (
              <span className="absolute -top-3 left-6 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-[11px] font-medium text-amber-500">
                {t("placeholder")}
              </span>
            )}
            <blockquote className="font-display text-xl leading-snug">“{item.quote[locale]}”</blockquote>
            <figcaption className="mt-8 text-sm">
              <p className="font-medium">{item.author}</p>
              <p className="text-fg-muted">{item.role[locale]}</p>
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  );
}
