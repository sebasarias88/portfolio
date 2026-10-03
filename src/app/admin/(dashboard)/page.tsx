import Link from "next/link";
import { redirect } from "next/navigation";
import { BarList } from "@/components/admin/BarList";
import { DailyChart } from "@/components/admin/DailyChart";
import { KpiCard } from "@/components/admin/KpiCard";
import type { AnalyticsReport } from "@/components/admin/types";
import { Monogram } from "@/components/ui/Monogram";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { signOut, updateLeadStatus } from "../actions";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;
const EVENT_LABELS: Record<string, string> = {
  cv_download: "Descargó CV",
  whatsapp_click: "Clic en WhatsApp",
  email_click: "Clic en email",
  project_view: "Vio un proyecto",
  outbound_click: "Visitó sitio externo",
  quote_sent: "Envió cotización",
  chat_started: "Inició chat",
};
const LEAD_STATUSES = ["new", "contacted", "won", "lost", "spam"] as const;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export default async function AdminDashboard({ searchParams }: PageProps<"/admin">) {
  if (!isSupabaseConfigured) {
    return <p className="p-10">Supabase no está configurado. Revisa las variables de entorno.</p>;
  }

  const params = await searchParams;
  const daysParam = Number(params.days);
  const days = (RANGES as readonly number[]).includes(daysParam) ? daysParam : 30;

  const supabase = await createSessionClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/admin/login");

  const [{ data: report, error }, { data: leads }] = await Promise.all([
    supabase.rpc("admin_analytics", { p_days: days }),
    supabase.from("leads").select("id, created_at, source, status, locale, details, name, contact").order("created_at", { ascending: false }).limit(20),
  ]);

  if (error || !report) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-semibold">Sin acceso</h1>
          <p className="mt-2 text-fg-muted">Tu usuario no tiene permisos de administrador.</p>
          <form action={signOut} className="mt-6">
            <button className="rounded-full border border-border px-5 py-2 text-sm">Cerrar sesión</button>
          </form>
        </div>
      </main>
    );
  }

  const r = report as unknown as AnalyticsReport;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Monogram className="size-9" />
          <div>
            <h1 className="font-display text-xl font-semibold">Analítica del portafolio</h1>
            <p className="text-sm text-fg-muted">Últimos {r.days} días · hora de Colombia</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex rounded-full border border-border p-1 text-xs" aria-label="Rango de fechas">
            {RANGES.map((d) => (
              <Link
                key={d}
                href={`/admin?days=${d}`}
                aria-current={d === days ? "page" : undefined}
                className={cn("rounded-full px-3 py-1.5", d === days ? "bg-fg text-bg" : "text-fg-muted hover:text-fg")}
              >
                {d} días
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <button className="rounded-full border border-border px-4 py-2 text-xs hover:border-accent">Salir</button>
          </form>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Visitantes" value={r.totals.visitors} previous={r.previous.visitors} />
        <KpiCard label="Vistas" value={r.totals.pageviews} previous={r.previous.pageviews} />
        <KpiCard label="CV descargados" value={r.totals.cv_downloads} previous={r.previous.cv_downloads} />
        <KpiCard label="Clics WhatsApp" value={r.totals.whatsapp_clicks} previous={r.previous.whatsapp_clicks} />
        <KpiCard label="Cotizaciones" value={r.totals.quotes} previous={r.previous.quotes} />
        <KpiCard label="Proyectos vistos" value={r.totals.project_views} previous={r.previous.project_views} />
      </section>

      <section className="mt-3 rounded-2xl border border-border bg-bg-elevated p-5">
        <h2 className="mb-4 text-sm font-medium text-fg-muted">Vistas por día</h2>
        <DailyChart data={r.daily} />
      </section>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <BarList title="Páginas más vistas" items={r.top_pages} />
        <BarList title="Campañas (?ref=)" items={r.refs} emptyLabel="Usa links como ?ref=linkedin o ?ref=cv" />
        <BarList title="De dónde llegan" items={r.referrers} />
        <BarList title="Países" items={r.countries} />
        <BarList title="Dispositivos" items={r.devices} />
        <section className="rounded-2xl border border-border bg-bg-elevated p-5">
          <h2 className="mb-4 text-sm font-medium text-fg-muted">Actividad reciente</h2>
          {r.recent.length === 0 ? (
            <p className="text-sm text-fg-muted">Sin actividad todavía</p>
          ) : (
            <ul className="grid gap-3 text-sm">
              {r.recent.map((e, i) => (
                <li key={`${e.created_at}-${i}`}>
                  <p>{EVENT_LABELS[e.type] ?? e.type}</p>
                  <p className="text-xs text-fg-muted">
                    {formatDateTime(e.created_at)} · {[e.city, e.country].filter(Boolean).join(", ") || "—"} · {e.device ?? "—"}
                    {e.ref ? ` · ref: ${e.ref}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-3 rounded-2xl border border-border bg-bg-elevated p-5">
        <h2 className="mb-4 text-sm font-medium text-fg-muted">Clientes potenciales</h2>
        {!leads || leads.length === 0 ? (
          <p className="text-sm text-fg-muted">Todavía no hay cotizaciones.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-fg-muted">
                <tr>
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Origen</th>
                  <th className="pb-3 font-medium">Detalle</th>
                  <th className="pb-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const details = (lead.details ?? {}) as { type?: string; addons?: string[]; estimate?: string };
                  return (
                    <tr key={lead.id} className="border-t border-border align-top">
                      <td className="py-3 pr-4 whitespace-nowrap">{formatDateTime(lead.created_at)}</td>
                      <td className="py-3 pr-4">{lead.source}</td>
                      <td className="py-3 pr-4">
                        {details.type} {details.addons?.length ? `+ ${details.addons.join(", ")}` : ""}
                        {details.estimate && <span className="block text-xs text-fg-muted">{details.estimate}</span>}
                      </td>
                      <td className="py-3">
                        <form action={updateLeadStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={lead.id} />
                          <select name="status" defaultValue={lead.status} className="rounded-lg border border-border bg-bg px-2 py-1 text-xs">
                            {LEAD_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button className="rounded-lg border border-border px-2 py-1 text-xs hover:border-accent">Guardar</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
