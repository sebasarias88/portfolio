import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjectBySlug } from "@/content/projects";
import { extraServices, monthlyPlan, servicePackages } from "@/content/services";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatCop, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Packages() {
  const t = useTranslations("Services");
  const tc = useTranslations("Common");
  const locale = useLocale() as Locale;

  const price = (cop: number | null, usd: number | null) => {
    if (cop === null || usd === null) return tc("quoteOnly");
    return locale === "es" ? formatCop(cop) : formatUsd(usd);
  };

  return (
    <section id="packages" className="container-page scroll-mt-24 py-20 md:py-32">
      <SectionHeading eyebrow={t("packagesEyebrow")} title={t("packagesTitle")} />

      <Reveal stagger={0.08} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {servicePackages.map((pkg) => (
          <article
            key={pkg.id}
            className={cn(
              "relative flex flex-col rounded-3xl border bg-bg-elevated p-6 md:p-8",
              pkg.highlighted ? "border-accent/60 shadow-[0_30px_90px_-40px_var(--accent-glow)]" : "border-border",
            )}
          >
            {pkg.highlighted && (
              <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-fg">{t("popular")}</span>
            )}
            <h3 className="font-display text-2xl font-semibold">{pkg.name[locale]}</h3>
            <p className="mt-2 text-sm text-fg-muted">{pkg.description[locale]}</p>
            <p className="mt-6">
              <span className="block font-mono text-xs text-fg-muted uppercase">{tc("from")}</span>
              <span className="font-display text-3xl font-semibold tracking-tight">{price(pkg.priceFromCop, pkg.priceFromUsd)}</span>
            </p>
            <ul className="mt-6 grid gap-2 text-sm">
              {pkg.features[locale].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-accent" aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {pkg.exampleProjects.length > 0 && (
              <p className="mt-auto pt-6 text-xs text-fg-muted">
                {t("examples")}:{" "}
                {pkg.exampleProjects.map((slug, i) => {
                  const project = getProjectBySlug(slug);
                  if (!project) return null;
                  return (
                    <span key={slug}>
                      {i > 0 && ", "}
                      <Link href={`/projects/${slug}`} className="underline decoration-border underline-offset-4 hover:text-fg">
                        {project.name}
                      </Link>
                    </span>
                  );
                })}
              </p>
            )}
          </article>
        ))}
      </Reveal>

      <p className="mt-6 text-sm text-fg-muted">{t("packagesNote")}</p>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Reveal className="rounded-3xl border border-border bg-bg-elevated p-6 md:p-8">
          <h3 className="font-display text-2xl font-semibold">{t("monthlyTitle")}</h3>
          <p className="mt-2 text-sm text-fg-muted">{t("monthlyDescription")}</p>
          <p className="mt-6 font-display text-3xl font-semibold tracking-tight">
            {locale === "es"
              ? `${formatCop(monthlyPlan.priceFromCop)} – ${formatCop(monthlyPlan.priceToCop)}`
              : `${formatUsd(monthlyPlan.priceFromUsd)} – ${formatUsd(monthlyPlan.priceToUsd)}`}
            <span className="text-base font-normal text-fg-muted">{tc("perMonth")}</span>
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
            {monthlyPlan.features[locale].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-accent" aria-hidden="true">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="rounded-3xl border border-border p-6 md:p-8">
          <h3 className="font-display text-2xl font-semibold">{t("extrasTitle")}</h3>
          <ul className="mt-6 flex flex-wrap gap-2">
            {extraServices[locale].map((s) => (
              <li key={s} className="rounded-full border border-border px-4 py-2 text-sm">
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
