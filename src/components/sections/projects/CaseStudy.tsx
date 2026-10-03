import { useLocale, useTranslations } from "next-intl";
import { ArrowIcon, Button } from "@/components/ui/Button";
import { DeviceMockup } from "@/components/ui/DeviceMockup";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Project } from "@/types/content";

interface CaseStudyProps {
  project: Project;
  next: Project;
}

export function CaseStudy({ project, next }: CaseStudyProps) {
  const t = useTranslations("CaseStudy");
  const tc = useTranslations("Common");
  const locale = useLocale() as Locale;
  const { caseStudy } = project;

  const facts = [
    { label: t("client"), value: project.client },
    { label: t("year"), value: String(project.year) },
    { label: t("role"), value: project.role[locale] },
    { label: t("stack"), value: project.stack.join(" · ") },
  ];

  return (
    <article>
      <header className="container-page pt-32 pb-12 md:pt-44">
        <Link href="/#work" className="mb-10 inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg">
          ← {tc("backHome")}
        </Link>
        <SplitHeading as="h1" immediate text={project.name} className="text-[clamp(3rem,10vw,8rem)] leading-[0.9] font-semibold" />
        <p className="mt-6 max-w-2xl text-xl text-fg-muted md:text-2xl">{project.tagline[locale]}</p>
        <dl className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="font-mono text-xs tracking-wider text-fg-muted uppercase">{f.label}</dt>
              <dd className="mt-2">{f.value}</dd>
            </div>
          ))}
        </dl>
        {project.liveUrl && (
          <div className="mt-8">
            <Button external href={project.liveUrl} data-track="outbound_click" data-track-label={project.slug}>
              {tc("visitSite")} <ArrowIcon />
            </Button>
          </div>
        )}
      </header>

      <Reveal className="container-page">
        <DeviceMockup video={project.video} poster={project.cover} accent={project.accent} label={project.name} />
      </Reveal>

      <div className="container-page grid gap-16 py-20 md:grid-cols-2 md:py-32">
        <Reveal>
          <h2 className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{t("problem")}</h2>
          <p className="mt-4 font-display text-2xl leading-snug md:text-3xl">{caseStudy.problem[locale]}</p>
        </Reveal>
        <Reveal>
          <h2 className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{t("solution")}</h2>
          <p className="mt-4 text-lg leading-relaxed text-fg-muted">{caseStudy.solution[locale]}</p>
        </Reveal>
        <Reveal>
          <h2 className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{t("highlights")}</h2>
          <ul className="mt-4 grid gap-3 text-lg">
            {caseStudy.highlights[locale].map((h) => (
              <li key={h} className="flex gap-3">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <h2 className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{t("result")}</h2>
          <p className="mt-4 text-lg leading-relaxed">{caseStudy.result[locale]}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4">
            {project.metrics.map((m) => (
              <div key={m.label.en} className="flex flex-col rounded-2xl border border-border p-4">
                <dt className="order-2 text-sm text-fg-muted">{m.label[locale]}</dt>
                <dd className="order-1 font-display text-3xl font-semibold">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <Link href={`/projects/${next.slug}`} className="group block border-t border-border">
        <div className="container-page flex items-center justify-between py-16 md:py-24">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-fg-muted uppercase">{t("next")}</p>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight transition-colors group-hover:text-accent md:text-7xl">{next.name}</p>
          </div>
          <ArrowIcon className="size-10 md:size-16" />
        </div>
      </Link>
    </article>
  );
}
