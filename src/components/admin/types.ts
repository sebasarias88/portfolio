export interface CountItem {
  label: string;
  count: number;
}

export interface Totals {
  pageviews: number;
  visitors: number;
  cv_downloads: number;
  whatsapp_clicks: number;
  quotes: number;
  project_views: number;
}

export interface AnalyticsReport {
  from: string;
  days: number;
  totals: Totals;
  previous: Totals;
  daily: { day: string; pageviews: number; visitors: number }[];
  top_pages: CountItem[];
  referrers: CountItem[];
  refs: CountItem[];
  countries: CountItem[];
  devices: CountItem[];
  recent: {
    created_at: string;
    type: string;
    path: string;
    country: string | null;
    city: string | null;
    device: string | null;
    ref: string | null;
    referrer_host: string | null;
  }[];
}
