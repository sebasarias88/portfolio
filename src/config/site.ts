/**
 * Global site configuration.
 * TODO(real-data): update `url` once the domain is purchased.
 */
export const siteConfig = {
  name: "Sebastián Arias",
  shortName: "SA",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sebastianarias.dev",
  email: "sebasarias78@gmail.com",
  /** International format without "+" or spaces, used for wa.me links */
  whatsapp: "573016611852",
  location: "Armenia, Quindío, Colombia",
  timeZone: "America/Bogota",
  available: true,
  socials: {
    github: "https://github.com/sebasarias88",
    linkedin: "https://www.linkedin.com/in/sebastian-arias-dev/",
  },
  resume: {
    es: "/cv/sebastian-arias-cv-es.pdf",
    en: "/cv/sebastian-arias-cv-en.pdf",
  },
} as const;

export type SiteConfig = typeof siteConfig;
