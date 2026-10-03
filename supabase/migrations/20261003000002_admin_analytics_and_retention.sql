-- Admin analytics (runs with the caller's privileges; RLS limits rows to admins),
-- admin read policy on events, and data-retention jobs for the free tier.

create policy "admins read events" on public.events
  for select to authenticated using ((select private.is_admin()));
grant select on public.events to authenticated;

CREATE OR REPLACE FUNCTION public.admin_analytics(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SECURITY INVOKER
 SET search_path TO ''
AS $function$
declare
  v_days integer := least(greatest(coalesce(p_days, 30), 1), 365);
  v_from timestamptz := date_trunc('day', now() at time zone 'America/Bogota') at time zone 'America/Bogota' - make_interval(days => v_days - 1);
  v_prev_from timestamptz := v_from - make_interval(days => v_days);
  v_result jsonb;
begin
  if not (select private.is_admin()) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  with cur as (
    select * from public.events where created_at >= v_from
  ),
  prev as (
    select * from public.events where created_at >= v_prev_from and created_at < v_from
  )
  select jsonb_build_object(
    'from', v_from,
    'days', v_days,
    'totals', jsonb_build_object(
      'pageviews', (select count(*) from cur where type = 'pageview'),
      'visitors', (select count(distinct visitor_hash) from cur),
      'cv_downloads', (select count(*) from cur where type = 'cv_download'),
      'whatsapp_clicks', (select count(*) from cur where type = 'whatsapp_click'),
      'quotes', (select count(*) from cur where type = 'quote_sent'),
      'project_views', (select count(*) from cur where type = 'project_view')
    ),
    'previous', jsonb_build_object(
      'pageviews', (select count(*) from prev where type = 'pageview'),
      'visitors', (select count(distinct visitor_hash) from prev),
      'cv_downloads', (select count(*) from prev where type = 'cv_download'),
      'whatsapp_clicks', (select count(*) from prev where type = 'whatsapp_click'),
      'quotes', (select count(*) from prev where type = 'quote_sent'),
      'project_views', (select count(*) from prev where type = 'project_view')
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'pageviews', coalesce(s.pageviews, 0), 'visitors', coalesce(s.visitors, 0)) order by d.day), '[]'::jsonb)
      from generate_series(
        (v_from at time zone 'America/Bogota')::date,
        (now() at time zone 'America/Bogota')::date,
        interval '1 day'
      ) as d(day)
      left join (
        select (created_at at time zone 'America/Bogota')::date as day,
               count(*) filter (where type = 'pageview') as pageviews,
               count(distinct visitor_hash) as visitors
        from cur group by 1
      ) s on s.day = d.day::date
    ),
    'top_pages', (
      select coalesce(jsonb_agg(t order by t.count desc), '[]'::jsonb) from (
        select path as label, count(*) as count from cur where type = 'pageview' group by path order by count(*) desc limit 10
      ) t
    ),
    'referrers', (
      select coalesce(jsonb_agg(t order by t.count desc), '[]'::jsonb) from (
        select coalesce(referrer_host, 'direct') as label, count(distinct visitor_hash) as count from cur where type = 'pageview' group by 1 order by 2 desc limit 10
      ) t
    ),
    'refs', (
      select coalesce(jsonb_agg(t order by t.count desc), '[]'::jsonb) from (
        select ref as label, count(distinct visitor_hash) as count from cur where ref is not null group by ref order by 2 desc limit 10
      ) t
    ),
    'countries', (
      select coalesce(jsonb_agg(t order by t.count desc), '[]'::jsonb) from (
        select coalesce(country, '??') as label, count(distinct visitor_hash) as count from cur group by 1 order by 2 desc limit 10
      ) t
    ),
    'devices', (
      select coalesce(jsonb_agg(t order by t.count desc), '[]'::jsonb) from (
        select coalesce(device, 'unknown') as label, count(distinct visitor_hash) as count from cur group by 1 order by 2 desc
      ) t
    ),
    'recent', (
      select coalesce(jsonb_agg(t order by t.created_at desc), '[]'::jsonb) from (
        select created_at, type, path, country, city, device, ref, referrer_host from cur
        where type <> 'pageview' order by created_at desc limit 20
      ) t
    )
  ) into v_result;

  return v_result;
end;
$function$;
revoke all on function public.admin_analytics(integer) from public, anon;
grant execute on function public.admin_analytics(integer) to authenticated;

create extension if not exists pg_cron;
select cron.schedule('purge-old-events', '15 3 * * *',
  $$ delete from public.events where created_at < now() - interval '400 days' $$);
select cron.schedule('purge-rate-limits', '*/30 * * * *',
  $$ delete from private.rate_limits where window_start < now() - interval '1 day' $$);
