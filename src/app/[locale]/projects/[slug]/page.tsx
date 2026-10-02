import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CaseStudy } from "@/components/sections/projects/CaseStudy";
import { getProjectBySlug, projects } from "@/content/projects";
import { routing, type Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.tagline[locale as Locale],
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: { es: `/es/projects/${slug}`, en: `/en/projects/${slug}` },
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = projects.at(index)!;
  const next = projects.at((index + 1) % projects.length)!;

  return <CaseStudy project={project} next={next} />;
}
