"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ArrowIcon } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { QUOTE_RANGE_FACTOR, quoteAddons, quoteBase } from "@/content/services";
import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/** Interactive estimator: pick a project type and add-ons, send it via WhatsApp. */
export function QuoteCalculator() {
  const t = useTranslations("Quote");
  const locale = useLocale() as Locale;
  const [baseId, setBaseId] = useState(quoteBase[0].id);
  const [addons, setAddons] = useState<string[]>([]);

  const { min, max, label, addonLabels } = useMemo(() => {
    const base = quoteBase.find((b) => b.id === baseId) ?? quoteBase[0];
    const selected = quoteAddons.filter((a) => addons.includes(a.id));
    const cop = base.cop + selected.reduce((sum, a) => sum + a.cop, 0);
    const usd = base.usd + selected.reduce((sum, a) => sum + a.usd, 0);
    const round = (n: number, step: number) => Math.round(n / step) * step;
    return {
      label: base.label[locale],
      addonLabels: selected.map((a) => a.label[locale]),
      min: formatPrice(locale, cop, usd),
      max: formatPrice(locale, round(cop * QUOTE_RANGE_FACTOR, 50000), round(usd * QUOTE_RANGE_FACTOR, 10)),
    };
  }, [baseId, addons, locale]);

  const toggleAddon = (id: string) =>
    setAddons((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]));

  const message = [
    t("messageIntro"),
    `• ${t("messageType")}: ${label}`,
    `• ${t("messageAddons")}: ${addonLabels.length ? addonLabels.join(", ") : t("none")}`,
    `• ${t("messageEstimate")}: ${min} – ${max}`,
  ].join("\n");

  return (
    <section id="quote" className="container-page scroll-mt-24 py-20 md:py-32">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border bg-bg-elevated p-6 md:p-8">
          <fieldset>
            <legend className="mb-4 font-mono text-xs tracking-wider text-fg-muted uppercase">{t("type")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {quoteBase.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                    baseId === option.id ? "border-accent bg-accent-soft" : "border-border hover:border-fg/30",
                  )}
                >
                  <input type="radio" name="project-type" value={option.id} checked={baseId === option.id} onChange={() => setBaseId(option.id)} className="sr-only" />
                  <span className="font-medium">{option.label[locale]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="mb-4 font-mono text-xs tracking-wider text-fg-muted uppercase">{t("addons")}</legend>
            <div className="flex flex-wrap gap-2">
              {quoteAddons.map((addon) => {
                const active = addons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleAddon(addon.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      active ? "border-accent bg-accent text-accent-fg" : "border-border hover:border-fg/30",
                    )}
                  >
                    {addon.label[locale]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-accent/40 bg-accent-soft p-6 md:p-8" aria-live="polite">
          <div>
            <p className="font-mono text-xs tracking-wider text-fg-muted uppercase">{t("estimate")}</p>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">{min}</p>
            <p className="font-display text-2xl text-fg-muted">– {max}</p>
            <p className="mt-6 text-sm text-fg-muted">{t("disclaimer")}</p>
          </div>
          <a
            href={buildWhatsAppUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 font-medium text-accent-fg transition-shadow hover:shadow-[0_8px_40px_-8px_var(--accent-glow)]"
          >
            {t("send")} <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
