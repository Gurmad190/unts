-- Phase 3 follow-up: allow the internal Supabase API role to read branding.
-- Browser access remains governed by the anon/authenticated grant and RLS.
GRANT SELECT ON public.branding_settings TO service_role;
