-- Allow the anonymous API role to evaluate the published-only RLS policy.
grant select on table public.announcements to anon;
