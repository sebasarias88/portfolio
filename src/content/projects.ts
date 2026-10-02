import type { Project } from "@/types/content";

/**
 * Portfolio projects. Add a new project by appending an object here.
 * TODO(real-data): add screen recordings to /public/projects/<slug>.mp4 and set
 * `video: "/projects/<slug>.mp4"` on each project (plus an optional `cover`).
 */
export const projects: Project[] = [
  {
    slug: "inmobiliaria-velar",
    name: "Inmobiliaria Velar",
    client: "Inmobiliaria Velar",
    year: 2026,
    category: "platform",
    featured: true,
    tagline: {
      es: "Plataforma inmobiliaria con búsqueda, mapas y panel administrativo.",
      en: "Real estate platform with search, maps and an admin panel.",
    },
    role: {
      es: "Contribuidor frontend · ajustes en backend (NestJS)",
      en: "Frontend contributor · backend fixes (NestJS)",
    },
    stack: ["React", "Vite", "NestJS", "Google Maps API"],
    liveUrl: "https://inmobiliariavelar.com",
    accent: "#9D8CFF",
    metrics: [
      { value: "3", label: { es: "apps en monorepo", en: "apps in a monorepo" } },
      { value: "Maps", label: { es: "ubicación de inmuebles", en: "property locations" } },
    ],
    caseStudy: {
      problem: {
        es: "La inmobiliaria necesitaba mostrar sus casas, apartamentos y lotes en Armenia y el Eje Cafetero, y administrar el inventario sin depender de un desarrollador.",
        en: "The agency needed to showcase houses, apartments and lots across Armenia and the Coffee Region, and manage its inventory without depending on a developer.",
      },
      solution: {
        es: "Dentro de un equipo, desarrollé gran parte del sitio público: listados, filtros, fichas de inmueble y ubicación en Google Maps, además de correcciones en el backend.",
        en: "As part of a team, I built most of the public site — listings, filters, property pages and Google Maps locations — and shipped backend fixes.",
      },
      highlights: {
        es: ["Búsqueda por tipo de inmueble y operación", "Mapa con ubicación de cada propiedad", "Panel para subir inmuebles, precios e imágenes"],
        en: ["Search by property type and deal type", "Map with each property's location", "Admin panel to manage listings, prices and images"],
      },
      result: {
        es: "El equipo de la inmobiliaria publica y actualiza sus inmuebles por su cuenta.",
        en: "The agency team publishes and updates listings on its own.",
      },
    },
  },
  {
    slug: "vm-fashion",
    name: "VM Fashion",
    client: "VM Fashion",
    year: 2025,
    category: "ecommerce",
    featured: true,
    tagline: {
      es: "Catálogo de belleza con tres experiencias: admin, detal y mayorista.",
      en: "Beauty catalog with three experiences: admin, retail and wholesale.",
    },
    role: { es: "Desarrollo completo", en: "End-to-end development" },
    stack: ["Next.js", "Supabase", "Tailwind CSS", "Framer Motion"],
    accent: "#E8C47A",
    metrics: [
      { value: "3", label: { es: "interfaces", en: "interfaces" } },
      { value: "WhatsApp", label: { es: "checkout", en: "checkout" } },
    ],
    caseStudy: {
      problem: {
        es: "La marca vendía a clientes finales y a mayoristas con precios distintos, y gestionaba todo por chat.",
        en: "The brand sold to retail and wholesale customers at different prices and managed everything over chat.",
      },
      solution: {
        es: "Un catálogo con interfaces separadas para detal y mayoristas, variaciones de producto, descuentos por categoría y un panel administrativo completo.",
        en: "A catalog with separate retail and wholesale experiences, product variations, category discounts and a full admin panel.",
      },
      highlights: {
        es: ["Checkout por WhatsApp", "Banners y franjas promocionales administrables", "Recargo configurable por método de pago"],
        en: ["WhatsApp checkout", "Admin-managed banners and promo strips", "Configurable surcharge per payment method"],
      },
      result: {
        es: "Pedidos organizados desde un solo catálogo para ambos tipos de cliente.",
        en: "Organized orders from a single catalog for both customer types.",
      },
    },
  },
  {
    slug: "lila-store",
    name: "Lila Store",
    client: "Lila Store",
    year: 2026,
    category: "ecommerce",
    featured: true,
    tagline: {
      es: "Tienda de cosméticos con cientos de productos optimizados.",
      en: "Cosmetics store with hundreds of optimized products.",
    },
    role: { es: "Desarrollo completo", en: "End-to-end development" },
    stack: ["Next.js", "TypeScript", "Supabase", "Vercel"],
    liveUrl: "https://lilastore.com.co",
    accent: "#F2A7C3",
    metrics: [
      { value: "600+", label: { es: "productos", en: "products" } },
      { value: "1.300+", label: { es: "imágenes WebP", en: "WebP images" } },
    ],
    caseStudy: {
      problem: {
        es: "Un catálogo grande de cosméticos que debía cargar rápido en celulares.",
        en: "A large cosmetics catalog that had to load fast on phones.",
      },
      solution: {
        es: "Catálogo con carrito, filtros, paginación y caché, con imágenes optimizadas en WebP y panel administrativo.",
        en: "Catalog with cart, filters, pagination and caching, WebP-optimized images and an admin panel.",
      },
      highlights: {
        es: ["Imágenes optimizadas en WebP", "Filtros y paginación con caché", "Dominio y DNS configurados"],
        en: ["WebP-optimized images", "Cached filters and pagination", "Domain and DNS setup"],
      },
      result: {
        es: "Un catálogo completo navegable desde el celular.",
        en: "A complete catalog that's easy to browse on mobile.",
      },
    },
  },
  {
    slug: "innova-seguridad",
    name: "INNOVA Seguridad",
    client: "INNOVA Seguridad y Sistemas",
    year: 2026,
    category: "corporate",
    featured: true,
    tagline: {
      es: "Sitio corporativo para una empresa de cámaras y sistemas de seguridad.",
      en: "Corporate site for a security cameras and systems company.",
    },
    role: { es: "Desarrollo completo", en: "End-to-end development" },
    stack: ["Next.js", "Tailwind CSS"], // TODO(real-data): confirm stack
    accent: "#5CC8FF",
    metrics: [{ value: "SEO", label: { es: "listo para buscadores", en: "search-ready" } }],
    caseStudy: {
      problem: {
        es: "La empresa necesitaba presentar sus servicios de seguridad con una imagen profesional.",
        en: "The company needed to present its security services with a professional image.",
      },
      solution: {
        es: "Un sitio corporativo con servicios, proyectos y contacto directo.",
        en: "A corporate site with services, projects and direct contact.",
      },
      highlights: {
        es: ["Diseño a medida", "Contacto por WhatsApp", "Optimizado para celular"],
        en: ["Custom design", "WhatsApp contact", "Mobile-first"],
      },
      result: {
        es: "Presencia digital profesional para captar clientes.",
        en: "A professional online presence to win clients.",
      },
    },
  },
  {
    slug: "cholao-oscar",
    name: "Cholao Oscar",
    client: "Cholao Oscar",
    year: 2025,
    category: "system",
    featured: true,
    tagline: {
      es: "Sistema de operación diaria y contabilidad para un negocio de cholados.",
      en: "Daily operations and accounting system for a local dessert business.",
    },
    role: { es: "Desarrollo completo", en: "End-to-end development" },
    stack: ["Next.js", "Supabase", "RBAC"],
    accent: "#7CE0A8",
    metrics: [
      { value: "Roles", label: { es: "acceso por rol", en: "role-based access" } },
      { value: "Diario", label: { es: "cierre de caja", en: "cash close" } },
    ],
    caseStudy: {
      problem: {
        es: "El cierre del día, el conteo de productos y los gastos se llevaban a mano.",
        en: "End-of-day closing, product counts and expenses were tracked by hand.",
      },
      solution: {
        es: "Un sistema web con control de roles y un flujo de cierre diario: conteo de productos, cuadre de caja y registro de gastos.",
        en: "A web system with role-based access and a daily closing flow: product count, cash reconciliation and expense tracking.",
      },
      highlights: {
        es: ["Cierre del día guiado", "Cuadre de caja", "Acceso por roles para trabajadores"],
        en: ["Guided end-of-day close", "Cash reconciliation", "Role-based access for staff"],
      },
      result: {
        es: "El dueño ve la operación de cada día en un solo lugar.",
        en: "The owner sees each day's operation in one place.",
      },
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}
