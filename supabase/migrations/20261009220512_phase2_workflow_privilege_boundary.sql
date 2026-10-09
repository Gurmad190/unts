-- Phase 2 follow-up: close direct browser writes for RPC-managed records.
REVOKE ALL ON FUNCTION public.audit_portal_change() FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.students, public.enrollments FROM anon, authenticated;
