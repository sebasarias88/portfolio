# Sebastián Arias — Portfolio

Personal portfolio (for recruiters) and services site (for clients), in Spanish and English.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** with CSS-variable design tokens (light/dark via `next-themes`)
- **next-intl** for i18n (`/es`, `/en`)
- **GSAP** (ScrollTrigger, SplitText) + **Lenis** smooth scroll
- **Three.js / React Three Fiber / Drei** (installed for Phase 3 — 3D desk + avatar)
- **Supabase** — cookie-less analytics, leads and the private `/admin` dashboard (see `supabase/README.md`)
- **AI chat** — `/api/chat`, provider chosen by `AI_PROVIDER` (Groq free tier or Anthropic Claude)

## Getting started

This project uses **yarn**.

```bash
yarn install
cp .env.example .env.local   # then fill in the keys
yarn dev           # http://localhost:3000
yarn build         # production build
yarn lint
yarn typecheck
```

## Project structure

```
messages/                 UI strings per locale (es.json, en.json)
public/                   static assets (cv/, images/, projects/)
src/
  app/
    [locale]/             localized routes
      page.tsx            portfolio (recruiters)
      services/           services page (clients)
      projects/[slug]/    case studies
      layout.tsx          fonts, providers, header/footer
      template.tsx        page-enter transition
    globals.css           design tokens + Tailwind theme
    sitemap.ts, robots.ts, icon.svg
  components/
    layout/               Header, Footer, Preloader, ThemeToggle, LocaleSwitcher…
    providers/            ThemeProvider, SmoothScrollProvider (Lenis + GSAP ticker)
    sections/home/        Hero, Stats, FeaturedProjects, Experience, TechStack, About, Contact
    sections/services/    ServicesHero, Packages, QuoteCalculator, Process, Faq, ServicesCta
    sections/projects/    CaseStudy
    ui/                   Button, Reveal, SplitHeading, Counter, Magnetic, DeviceMockup, Monogram
  config/site.ts          name, contact, socials, WhatsApp, CV paths
  content/                typed, localized content (profile, projects, experience, skills, services)
  i18n/                   next-intl routing, navigation and request config
  lib/                    gsap setup, formatting, WhatsApp links, helpers
  types/content.ts        content types
  proxy.ts                locale detection / redirects
```

## Replacing placeholder data

Search for `TODO(real-data)`:

- `src/config/site.ts` — email, WhatsApp number, domain
- `src/content/profile.ts` — photo (`public/images/profile.jpg`), copy
- `src/content/projects.ts` — videos (`public/projects/<slug>.mp4`), INNOVA stack
- `src/content/services.ts` — USD prices
- `public/cv/` — `sebastian-arias-cv-es.pdf` and `sebastian-arias-cv-en.pdf`

## Adding a project

Append an object to `projects` in `src/content/projects.ts`. Its case study page
(`/[locale]/projects/<slug>`) and sitemap entry are generated automatically.
