import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { projects } from "@/content/projects";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/services", ...projects.map((p) => `/projects/${p.slug}`)];
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${siteConfig.url}/${l}${path}`])),
      },
    })),
  );
}
