-- Phase 3 academic calendar enhancement. Existing term values are preserved.
ALTER TABLE public.academic_terms
  ADD COLUMN IF NOT EXISTS academic_year text,
  ADD COLUMN IF NOT EXISTS term_type text,
  ADD COLUMN IF NOT EXISTS registration_opens date,
  ADD COLUMN IF NOT EXISTS registration_closes date;

CREATE OR REPLACE FUNCTION public.update_academic_term(
  p_term_id uuid,
  p_name text,
  p_code text,
  p_starts_on date,
  p_ends_on date,
  p_academic_year text DEFAULT NULL,
  p_term_type text DEFAULT NULL,
  p_registration_opens date DEFAULT NULL,
  p_registration_closes date DEFAULT NULL
)
RETURNS public.academic_terms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_term public.academic_terms;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin','admin','registrar']) THEN
    RAISE EXCEPTION 'You are not authorised to edit academic terms' USING ERRCODE = '42501';
  END IF;
  IF nullif(trim(p_name), '') IS NULL OR nullif(trim(p_code), '') IS NULL OR p_starts_on >= p_ends_on THEN
    RAISE EXCEPTION 'A term name, code and valid date range are required' USING ERRCODE = '22023';
  END IF;
  IF p_registration_opens IS NOT NULL AND p_registration_closes IS NOT NULL AND p_registration_opens > p_registration_closes THEN
    RAISE EXCEPTION 'Registration opening must be before registration closing' USING ERRCODE = '22023';
  END IF;
  UPDATE public.academic_terms
  SET name = trim(p_name), code = upper(trim(p_code)), starts_on = p_starts_on, ends_on = p_ends_on,
      academic_year = nullif(trim(p_academic_year), ''), term_type = nullif(trim(p_term_type), ''),
      registration_opens = p_registration_opens, registration_closes = p_registration_closes, updated_at = now()
  WHERE id = p_term_id
  RETURNING * INTO v_term;
  IF v_term.id IS NULL THEN RAISE EXCEPTION 'Academic term not found' USING ERRCODE = 'P0002'; END IF;
  RETURN v_term;
END;
$$;
REVOKE ALL ON FUNCTION public.update_academic_term(uuid, text, text, date, date, text, text, date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_academic_term(uuid, text, text, date, date, text, text, date, date) TO authenticated;
