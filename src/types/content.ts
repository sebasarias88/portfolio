import type { Locale } from "@/i18n/routing";

/** A value translated into every supported locale. */
export type Localized<T = string> = Record<Locale, T>;

export type ProjectCategory = "ecommerce" | "platform" | "corporate" | "system";

export interface ProjectMetric {
  value: string;
  label: Localized;
}

export interface Project {
  slug: string;
  name: string;
  client: string;
  year: number;
  category: ProjectCategory;
  featured: boolean;
  /** Short one-line pitch shown on cards */
  tagline: Localized;
  role: Localized;
  stack: string[];
  liveUrl?: string;
  /** Path under /public — screen recording shown inside the device mockup */
  video?: string;
  cover?: string;
  /** Accent hue used for the project card glow (CSS color) */
  accent: string;
  metrics: ProjectMetric[];
  caseStudy: {
    problem: Localized;
    solution: Localized;
    highlights: Localized<string[]>;
    result: Localized;
  };
}

export interface ExperienceItem {
  company: string;
  location: Localized;
  role: Localized;
  start: string;
  end?: string;
  achievements: Localized<string[]>;
  products: string[];
}

export interface SkillGroup {
  title: Localized;
  items: string[];
}

export interface ServicePackage {
  id: string;
  name: Localized;
  description: Localized;
  /** Starting price in COP; null = quote only */
  priceFromCop: number | null;
  /** Starting price in USD for international clients; null = quote only */
  priceFromUsd: number | null;
  features: Localized<string[]>;
  exampleProjects: string[];
  highlighted?: boolean;
}

export interface QuoteOption {
  id: string;
  label: Localized;
  cop: number;
  usd: number;
}

export interface FaqItem {
  question: Localized;
  answer: Localized;
}

export interface Testimonial {
  quote: Localized;
  author: string;
  role: Localized;
  /** Related project slug, if any */
  project?: string;
  /**
   * Placeholder copy used while real testimonials arrive.
   * Placeholders render only in development and never ship to production.
   */
  placeholder?: boolean;
}
