import type { FaqItem, Localized, QuoteOption, ServicePackage } from "@/types/content";

/** TODO(real-data): confirm USD prices for international clients. */
export const servicePackages: ServicePackage[] = [
  {
    id: "landing",
    name: { es: "Landing page", en: "Landing page" },
    description: {
      es: "Una página enfocada en convertir visitas en mensajes de WhatsApp.",
      en: "A single page focused on turning visits into conversations.",
    },
    priceFromCop: 900000,
    priceFromUsd: 350,
    features: {
      es: ["Diseño a medida", "Botón de WhatsApp", "Optimizada para celular", "Entrega rápida"],
      en: ["Custom design", "WhatsApp button", "Mobile-first", "Fast delivery"],
    },
    exampleProjects: [],
  },
  {
    id: "corporate",
    name: { es: "Web corporativa", en: "Corporate website" },
    description: {
      es: "Sitio de 5 a 8 secciones para presentar tu empresa con SEO.",
      en: "A 5–8 section site to present your company, SEO included.",
    },
    priceFromCop: 1800000,
    priceFromUsd: 700,
    features: {
      es: ["Hasta 8 secciones", "SEO técnico", "Formulario y WhatsApp", "Analítica"],
      en: ["Up to 8 sections", "Technical SEO", "Form and WhatsApp", "Analytics"],
    },
    exampleProjects: ["innova-seguridad"],
  },
  {
    id: "store",
    name: { es: "Catálogo o tienda", en: "Catalog or store" },
    description: {
      es: "Tus productos en línea con carrito, panel administrativo y pagos.",
      en: "Your products online with cart, admin panel and payments.",
    },
    priceFromCop: 3000000,
    priceFromUsd: 1200,
    features: {
      es: ["Panel administrativo", "Carrito y checkout", "Pasarela de pagos", "Imágenes optimizadas"],
      en: ["Admin panel", "Cart and checkout", "Payment gateway", "Optimized images"],
    },
    exampleProjects: ["vm-fashion", "lila-store"],
    highlighted: true,
  },
  {
    id: "custom",
    name: { es: "Sistema a medida", en: "Custom system" },
    description: {
      es: "Software para tu operación: inventario, caja, roles, reportes.",
      en: "Software for your operation: inventory, cash, roles, reports.",
    },
    priceFromCop: 4500000,
    priceFromUsd: 1800,
    features: {
      es: ["Usuarios y roles", "Reportes", "Integraciones", "Soporte post-entrega"],
      en: ["Users and roles", "Reports", "Integrations", "Post-launch support"],
    },
    exampleProjects: ["cholao-oscar", "inmobiliaria-velar"],
  },
];

export const monthlyPlan = {
  priceFromCop: 100000,
  priceToCop: 150000,
  priceFromUsd: 40,
  priceToUsd: 60,
  features: {
    es: ["Hosting y dominio", "Soporte y cambios menores", "Copias de seguridad", "Monitoreo"],
    en: ["Hosting and domain", "Support and small changes", "Backups", "Monitoring"],
  } satisfies Localized<string[]>,
};

export const extraServices: Localized<string[]> = {
  es: ["Apps móviles (React Native)", "Automatizaciones con WhatsApp y n8n", "Chatbots e IA", "Pasarelas de pago", "Optimización de velocidad", "Rediseño de páginas"],
  en: ["Mobile apps (React Native)", "WhatsApp and n8n automations", "Chatbots and AI", "Payment gateways", "Speed optimization", "Website redesigns"],
};

export const quoteBase: QuoteOption[] = [
  { id: "landing", label: { es: "Landing page", en: "Landing page" }, cop: 900000, usd: 350 },
  { id: "corporate", label: { es: "Web corporativa", en: "Corporate website" }, cop: 1800000, usd: 700 },
  { id: "store", label: { es: "Catálogo o tienda", en: "Catalog or store" }, cop: 3000000, usd: 1200 },
  { id: "custom", label: { es: "Sistema a medida", en: "Custom system" }, cop: 4500000, usd: 1800 },
];

export const quoteAddons: QuoteOption[] = [
  { id: "admin", label: { es: "Panel administrativo", en: "Admin panel" }, cop: 800000, usd: 300 },
  { id: "payments", label: { es: "Pagos en línea", en: "Online payments" }, cop: 600000, usd: 250 },
  { id: "i18n", label: { es: "Dos idiomas", en: "Two languages" }, cop: 400000, usd: 150 },
  { id: "blog", label: { es: "Blog o noticias", en: "Blog or news" }, cop: 500000, usd: 200 },
  { id: "ai", label: { es: "Chatbot con IA", en: "AI chatbot" }, cop: 900000, usd: 350 },
  { id: "rush", label: { es: "Entrega urgente", en: "Rush delivery" }, cop: 500000, usd: 200 },
];

/** Upper bound of the estimate range, relative to the computed minimum. */
export const QUOTE_RANGE_FACTOR = 1.35;

export const processSteps: { title: Localized; description: Localized }[] = [
  {
    title: { es: "Conversamos", en: "We talk" },
    description: { es: "Entiendo tu negocio, tus clientes y lo que necesitas.", en: "I learn about your business, customers and goals." },
  },
  {
    title: { es: "Diseño", en: "Design" },
    description: { es: "Te muestro la propuesta visual antes de programar.", en: "You see the visual proposal before any code." },
  },
  {
    title: { es: "Desarrollo", en: "Build" },
    description: { es: "Construyo la página con avances que puedes revisar.", en: "I build it with previews you can review." },
  },
  {
    title: { es: "Lanzamiento", en: "Launch" },
    description: { es: "Publico, configuro el dominio y te enseño a usarla.", en: "I deploy, set up the domain and walk you through it." },
  },
];

export const faqs: FaqItem[] = [
  {
    question: { es: "¿Cuánto tiempo toma una página?", en: "How long does a website take?" },
    answer: {
      es: "Una landing toma pocos días; una tienda o un sistema, entre 3 y 8 semanas según el alcance.",
      en: "A landing page takes a few days; a store or system takes 3–8 weeks depending on scope.",
    },
  },
  {
    question: { es: "¿El precio incluye dominio y hosting?", en: "Does the price include domain and hosting?" },
    answer: {
      es: "El primer año se puede incluir con el plan mensual, que cubre hosting, dominio y soporte.",
      en: "It can be included through the monthly plan, which covers hosting, domain and support.",
    },
  },
  {
    question: { es: "¿Puedo administrar mi página yo mismo?", en: "Can I manage my website myself?" },
    answer: {
      es: "Sí. Los catálogos, tiendas y sistemas incluyen un panel para que cambies productos, precios e imágenes.",
      en: "Yes. Catalogs, stores and systems include an admin panel to update products, prices and images.",
    },
  },
  {
    question: { es: "¿Cómo es el pago?", en: "How does payment work?" },
    answer: {
      es: "50% para iniciar y 50% al entregar. Para proyectos grandes se divide por etapas.",
      en: "50% to start and 50% on delivery. Larger projects are split into milestones.",
    },
  },
];
