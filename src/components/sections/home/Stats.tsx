import { useLocale, useTranslations } from "next-intl";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";

export function Stats() {
  const t = useTranslations("Stats");
  const locale = useLocale() as Locale;

  return (
    <section aria-label={t("title")} className="container-page py-20 md:py-28">
      <Reveal as="p" className="mb-10 max-w-md font-display text-2xl font-medium text-balance">
        {t("title")}
      </Reveal>
      <Reveal as="dl" stagger={0.1} className="grid grid-cols-2 border-t border-l border-border md:grid-cols-4">
        {profile.stats.map((s) => (
          <div key={s.label.en} className="flex flex-col border-r border-b border-border p-6 md:p-8">
            <dt className="order-2 mt-2 text-sm text-fg-muted">{s.label[locale]}</dt>
            <dd className="order-1 font-display text-4xl font-semibold tracking-tight md:text-6xl">
              <Counter value={s.value} suffix={s.suffix} />
            </dd>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
