-- Phase 3 academic calendar compatibility fix.
-- The foundation table predates updated_at; add it without changing existing term values.
ALTER TABLE public.academic_terms
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
