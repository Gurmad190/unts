-- Phase 2 audit append-only boundary.
-- Audit records are written by the SECURITY DEFINER trigger function only.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.audit_logs FROM anon, authenticated;
