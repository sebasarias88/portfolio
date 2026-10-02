import type { Localized } from "@/types/content";

/** TODO(real-data): review copy, add a photo at /public/images/profile.jpg and set `photo` to that path. */
export const profile = {
  name: "Sebastián Arias",
  role: "Full Stack Software Engineer",
  yearsOfExperience: 3,
  photo: null as string | null,
  headline: {
    es: "Construyo productos web rápidos, escalables y con detalle.",
    en: "I build fast, scalable web products with obsessive detail.",
  } satisfies Localized,
  intro: {
    es: "Desarrollador full stack con más de 3 años llevando productos a producción con React, Next.js, TypeScript y NestJS: desde la arquitectura hasta el último píxel.",
    en: "Full stack developer with 3+ years shipping products to production with React, Next.js, TypeScript and NestJS — from architecture to the last pixel.",
  } satisfies Localized,
  about: {
    es: [
      "Soy de Armenia, Quindío, y trabajo de forma remota para equipos y clientes de distintos países. Aprendí a programar por mi cuenta y llevo más de tres años construyendo software que usan miles de personas.",
      "Me muevo cómodo en todo el stack: interfaces con animaciones cuidadas, APIs, bases de datos, integraciones y despliegues. Me gusta entender el negocio antes de escribir una línea de código.",
    ],
    en: [
      "I'm based in Armenia, Colombia, and work remotely with teams and clients across countries. I'm self-taught and have spent the last three-plus years building software used by thousands of people.",
      "I'm comfortable across the whole stack: polished, animated interfaces, APIs, databases, integrations and deployments. I like to understand the business before writing a single line of code.",
    ],
  } satisfies Localized<string[]>,
  stats: [
    { value: 12000, suffix: "+", label: { es: "usuarios en plataformas", en: "platform users" } },
    { value: 300, suffix: "+", label: { es: "clubes deportivos", en: "sports clubs" } },
    { value: 100, suffix: "+", label: { es: "instituciones", en: "institutions" } },
    { value: 600, suffix: "+", label: { es: "productos en catálogos", en: "catalog products" } },
  ] satisfies { value: number; suffix: string; label: Localized }[],
} as const;
