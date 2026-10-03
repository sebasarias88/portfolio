# Supabase

Project: `sebastian-arias-portfolio` (ref `pklpmenxykyzpwcnbxmm`, region us-east-1, free tier).

These migrations are already applied to the project; they are kept here as the source of truth.

## Security model

- The public site never queries Supabase directly. Events and quotes are written by
  `/api/track` and `/api/quote` (server-only secret key) after origin check, bot filter,
  zod validation, payload size limit and per-IP rate limiting (`check_rate_limit`).
- RLS is enabled and forced on every table. `anon` has no privileges at all.
- The admin dashboard reads through RLS policies that require `private.is_admin()`.
- No IPs or cookies are stored: visitors are a daily-salted SHA-256 hash.
- `pg_cron` purges events after 400 days and rate-limit rows after 1 day.

## Granting admin access

After creating your user in Authentication → Users:

```sql
insert into private.admins (user_id)
select id from auth.users where email = 'your@email.com';
```
