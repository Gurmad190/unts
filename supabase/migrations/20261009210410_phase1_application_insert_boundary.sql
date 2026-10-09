-- Close the direct application-insert path. Public submissions use
-- public.submit_application(), which runs as its function owner.
DROP POLICY IF EXISTS applications_create ON public.applications;
REVOKE INSERT ON public.applications FROM anon, authenticated;