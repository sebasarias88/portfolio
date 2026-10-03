-- Portfolio backend: analytics events, leads, admin access, rate limiting.
-- Security model:
--   * The public website never talks to these tables directly. All writes go
--     through Next.js route handlers using the server-only secret key, after
--     validation and rate limiting.
--   * anon has no privileges. Authenticated users only get rows through RLS
--     policies that require private.is_admin().

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from private.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create table public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null check (type in (
    'pageview', 'cv_download', 'whatsapp_click', 'email_click',
    'project_view', 'outbound_click', 'quote_sent', 'chat_started'
  )),
  path text not null check (char_length(path) <= 300),
  locale text check (locale in ('es', 'en')),
  referrer_host text check (char_length(referrer_host) <= 200),
  ref text check (char_length(ref) <= 60),
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  country text check (char_length(country) <= 2),
  city text check (char_length(city) <= 100),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  browser text check (char_length(browser) <= 40),
  os text check (char_length(os) <= 40),
  meta jsonb check (meta is null or pg_column_size(meta) <= 2048)
);
create index events_created_at_idx on public.events (created_at desc);
create index events_type_created_at_idx on public.events (type, created_at desc);
create index events_visitor_idx on public.events (visitor_hash, created_at desc);

alter table public.events enable row level security;
alter table public.events force row level security;
revoke all on public.events from anon, authenticated;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null check (source in ('quote', 'chat', 'contact')),
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost', 'spam')),
  locale text check (locale in ('es', 'en')),
  name text check (char_length(name) <= 120),
  contact text check (char_length(contact) <= 160),
  message text check (char_length(message) <= 4000),
  details jsonb check (details is null or pg_column_size(details) <= 8192),
  visitor_hash text check (char_length(visitor_hash) = 64)
);
create index leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
alter table public.leads force row level security;
revoke all on public.leads from anon, authenticated;

create policy "admins read leads" on public.leads
  for select to authenticated using ((select private.is_admin()));
create policy "admins update leads" on public.leads
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
grant select, update (status) on public.leads to authenticated;

create table private.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

create or replace function public.check_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  if p_key is null or char_length(p_key) > 200 or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;
  insert into private.rate_limits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into v_hits;
  return v_hits <= p_limit;
end;
$$;
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
