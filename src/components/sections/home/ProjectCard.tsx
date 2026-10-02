import { useLocale, useTranslations } from "next-intl";
import { ArrowIcon, Button } from "@/components/ui/Button";
import { DeviceMockup } from "@/components/ui/DeviceMockup";
import type { Locale } from "@/i18n/routing";
import type { Project } from "@/types/content";

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
}

export function ProjectCard({ project, index, total }: ProjectCardProps) {
  const t = useTranslations("Work");
  const tc = useTranslations("Common");
  const locale = useLocale() as Locale;
  const number = (n: number) => String(n).padStart(2, "0");

  return (
    <article
      data-project-card
      className="relative grid gap-8 overflow-hidden rounded-[2rem] border border-border bg-bg-elevated p-6 md:grid-cols-[1fr_1.4fr] md:items-center md:p-10"
      style={{ boxShadow: `0 0 120px -60px ${project.accent}` }}
    >
      <div className="flex flex-col gap-6">
        <p className="font-mono text-xs text-fg-muted">
          {number(index + 1)} / {number(total)} · {project.year}
        </p>
        <div>
          <h3 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{project.name}</h3>
          <p className="mt-3 text-fg-muted md:text-lg">{project.tagline[locale]}</p>
        </div>

        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="mb-1 font-mono text-xs tracking-wider text-fg-muted uppercase">{t("role")}</dt>
            <dd>{project.role[locale]}</dd>
          </div>
          <div>
            <dt className="mb-2 font-mono text-xs tracking-wider text-fg-muted uppercase">{t("stack")}</dt>
            <dd>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <li key={s} className="rounded-full border border-border px-3 py-1 text-xs">
                    {s}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          <Button href={`/projects/${project.slug}`}>
            {tc("viewProject")} <ArrowIcon />
          </Button>
          {project.liveUrl && (
            <Button external href={project.liveUrl} variant="secondary">
              {tc("visitSite")}
            </Button>
          )}
        </div>
      </div>

      <DeviceMockup video={project.video} poster={project.cover} accent={project.accent} label={project.name} />
    </article>
  );
}
