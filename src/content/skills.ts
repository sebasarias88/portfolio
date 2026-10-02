import type { SkillGroup } from "@/types/content";

export const skillGroups: SkillGroup[] = [
  {
    title: { es: "Frontend", en: "Frontend" },
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "TanStack Query", "GSAP", "Framer Motion", "React Native"],
  },
  {
    title: { es: "Backend", en: "Backend" },
    items: ["Node.js", "NestJS", "Express", "REST", "GraphQL", "SSE", "Queues"],
  },
  {
    title: { es: "Bases de datos", en: "Databases" },
    items: ["PostgreSQL", "MySQL", "MongoDB", "Supabase", "Firebase", "Stored procedures"],
  },
  {
    title: { es: "Cloud y herramientas", en: "Cloud & tools" },
    items: ["Vercel", "AWS", "Docker", "Cloudflare R2", "Git", "n8n"],
  },
];
