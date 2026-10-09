-- Phase 3 follow-up: expose the public branding singleton through PostgREST.
-- RLS still limits writes to administrators; this only adds the read grant
-- required by the public header/footer and authenticated portal settings page.
GRANT SELECT ON public.branding_settings TO anon, authenticated;
