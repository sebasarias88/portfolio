import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experience } from "@/content/experience";
import type { Locale } from "@/i18n/routing";

function formatMonth(value: string, locale: Locale) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "es" ? "es-CO" : "en-US", { month: "short", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, 15)),
  );
}

export function Experience() {
  const t = useTranslations("Experience");
  const locale = useLocale() as Locale;

  return (
    <section id="experience" className="container-page scroll-mt-24 py-20 md:py-32">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <ol className="border-t border-border">
        {experience.map((job) => (
          <Reveal as="li" key={job.company} className="grid gap-6 border-b border-border py-10 md:grid-cols-[14rem_1fr] md:gap-12">
            <div className="font-mono text-sm text-fg-muted">
              {formatMonth(job.start, locale)} — {job.end ? formatMonth(job.end, locale) : t("present")}
              <p className="mt-1">{job.location[locale]}</p>
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold md:text-3xl">
                {job.role[locale]} <span className="text-accent">@ {job.company}</span>
              </h3>
              <ul className="mt-6 grid gap-3 text-fg-muted md:text-lg">
                {job.achievements[locale].map((a) => (
                  <li key={a} className="flex gap-3">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-xs tracking-wider text-fg-muted uppercase">{t("products")}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {job.products.map((p) => (
                  <li key={p} className="rounded-full border border-border px-3 py-1 text-xs">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
