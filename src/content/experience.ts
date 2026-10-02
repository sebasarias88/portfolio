import type { ExperienceItem } from "@/types/content";

export const experience: ExperienceItem[] = [
  {
    company: "Prospect1",
    location: { es: "Panamá · Remoto", en: "Panama · Remote" },
    role: { es: "Full Stack Software Engineer", en: "Full Stack Software Engineer" },
    start: "2023-04",
    achievements: {
      es: [
        "Plataformas usadas por más de 12.000 usuarios, 300+ clubes y 100+ instituciones.",
        "Procesamiento asíncrono de cargas masivas de 1.000+ registros con colas, Firebase y Server-Sent Events.",
        "Integraciones con CRM, Meta, WhatsApp e IA, y notificaciones push en la app móvil (React Native).",
        "Decisiones de arquitectura, caché y procesamiento de datos; atención de incidentes críticos en producción.",
        "Onboarding y acompañamiento de nuevos desarrolladores del equipo.",
      ],
      en: [
        "Platforms used by 12,000+ users, 300+ clubs and 100+ institutions.",
        "Asynchronous bulk processing of 1,000+ records using queues, Firebase and Server-Sent Events.",
        "Integrations with CRM, Meta, WhatsApp and AI services, plus push notifications in the React Native app.",
        "Architecture, caching and data-processing decisions; handled critical production incidents.",
        "Onboarded and mentored new developers on the team.",
      ],
    },
    products: ["Prospect1.team", "admin.prospect1.team", "Mercatto", "Mobile app"],
  },
];
