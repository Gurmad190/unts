-- Phase 2 operational workflows and audit boundaries
-- Additive and non-destructive. Historical migrations must not be replayed.

-- There must be at most one current academic term. The hosted data currently has one.
CREATE UNIQUE INDEX IF NOT EXISTS academic_terms_one_current
  ON public.academic_terms (is_current)
  WHERE is_current = true;

CREATE OR REPLACE FUNCTION public.set_current_term(p_term_id uuid)
RETURNS TABLE(id uuid, name text, code text, starts_on date, ends_on date, is_current boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin', 'admin', 'registrar']::text[]) THEN
    RAISE EXCEPTION 'You are not authorised to manage academic terms' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.academic_terms WHERE academic_terms.id = p_term_id) THEN
    RAISE EXCEPTION 'Academic term not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.academic_terms
  SET is_current = false
  WHERE academic_terms.is_current = true AND academic_terms.id <> p_term_id;

  UPDATE public.academic_terms
  SET is_current = true
  WHERE academic_terms.id = p_term_id;

  RETURN QUERY
  SELECT t.id, t.name, t.code, t.starts_on, t.ends_on, t.is_current
  FROM public.academic_terms t
  WHERE t.id = p_term_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_current_term(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_current_term(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_application_status(
  p_application_id uuid,
  p_status text,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(application_id uuid, application_status text, reviewed_at timestamptz, notes text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_status text;
  v_reviewed_at timestamptz;
  v_notes text;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin', 'admin', 'admissions']::text[]) THEN
    RAISE EXCEPTION 'You are not authorised to manage applications' USING ERRCODE = '42501';
  END IF;

  IF p_status NOT IN ('new', 'review', 'withdrawn') THEN
    RAISE EXCEPTION 'This workflow only handles new, review and withdrawn states; use the admission decision workflow for a final decision' USING ERRCODE = '22023';
  END IF;

  SELECT a.status, a.reviewed_at, a.notes
    INTO v_existing_status, v_reviewed_at, v_notes
  FROM public.applications a
  WHERE a.id = p_application_id
  FOR UPDATE;

  IF v_existing_status IS NULL THEN
    RAISE EXCEPTION 'Application not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_existing_status IN ('accepted', 'rejected') THEN
    RAISE EXCEPTION 'A finalised application cannot return to a review state' USING ERRCODE = '22023';
  END IF;

  IF p_status = 'withdrawn' AND v_existing_status = 'withdrawn' THEN
    RETURN QUERY SELECT p_application_id, v_existing_status, v_reviewed_at, v_notes;
    RETURN;
  END IF;

  UPDATE public.applications a
  SET status = p_status,
      reviewed_at = CASE WHEN p_status = 'review' THEN COALESCE(a.reviewed_at, now()) ELSE a.reviewed_at END,
      notes = CASE WHEN p_notes IS NULL THEN a.notes ELSE nullif(trim(p_notes), '') END,
      updated_at = now()
  WHERE a.id = p_application_id
  RETURNING a.status, a.reviewed_at, a.notes
  INTO v_existing_status, v_reviewed_at, v_notes;

  RETURN QUERY SELECT p_application_id, v_existing_status, v_reviewed_at, v_notes;
END;
$$;

REVOKE ALL ON FUNCTION public.set_application_status(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_application_status(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_student_status(
  p_student_id uuid,
  p_status text
)
RETURNS TABLE(student_id uuid, student_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin', 'admin', 'registrar']::text[]) THEN
    RAISE EXCEPTION 'You are not authorised to manage student records' USING ERRCODE = '42501';
  END IF;

  IF p_status NOT IN ('active', 'graduated', 'suspended', 'withdrawn', 'inactive') THEN
    RAISE EXCEPTION 'Unsupported student status' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  UPDATE public.students s
  SET status = p_status, updated_at = now()
  WHERE s.id = p_student_id
  RETURNING s.id, s.status;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_student_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_student_status(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.enroll_student_in_term(
  p_student_id uuid,
  p_term_id uuid
)
RETURNS TABLE(enrollment_id uuid, student_id uuid, program_id uuid, term_id uuid, enrollment_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_program_id uuid;
  v_enrollment_id uuid;
  v_status text;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin', 'admin', 'registrar']::text[]) THEN
    RAISE EXCEPTION 'You are not authorised to manage enrollments' USING ERRCODE = '42501';
  END IF;

  SELECT s.program_id INTO v_program_id
  FROM public.students s
  WHERE s.id = p_student_id AND s.status IN ('active', 'inactive')
  FOR UPDATE;

  IF v_program_id IS NULL THEN
    RAISE EXCEPTION 'An active or inactive student record is required' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.academic_terms t WHERE t.id = p_term_id) THEN
    RAISE EXCEPTION 'Academic term not found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.enrollments (student_id, program_id, term_id, status)
  VALUES (p_student_id, v_program_id, p_term_id, 'enrolled')
  ON CONFLICT (student_id, term_id) DO UPDATE
    SET program_id = EXCLUDED.program_id,
        status = 'enrolled'
  RETURNING id, enrollments.status INTO v_enrollment_id, v_status;

  RETURN QUERY SELECT v_enrollment_id, p_student_id, v_program_id, p_term_id, v_status;
END;
$$;

REVOKE ALL ON FUNCTION public.enroll_student_in_term(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enroll_student_in_term(uuid, uuid) TO authenticated;

-- Record sensitive operational changes without allowing browser users to alter the log.
CREATE OR REPLACE FUNCTION public.audit_portal_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_row jsonb;
  v_entity_id uuid;
  v_metadata jsonb;
BEGIN
  v_row := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
  v_entity_id := CASE
    WHEN TG_TABLE_NAME = 'user_roles' THEN (v_row ->> 'user_id')::uuid
    ELSE (v_row ->> 'id')::uuid
  END;
  v_metadata := jsonb_build_object('operation', lower(TG_OP));

  IF TG_TABLE_NAME IN ('applications', 'students', 'enrollments', 'academic_terms', 'courses', 'announcements') THEN
    v_metadata := v_metadata || jsonb_build_object('status', v_row ->> 'status', 'is_current', v_row ->> 'is_current');
  ELSIF TG_TABLE_NAME = 'user_roles' THEN
    v_metadata := v_metadata || jsonb_build_object('role', v_row ->> 'role');
  ELSIF TG_TABLE_NAME = 'admissions_decisions' THEN
    v_metadata := v_metadata || jsonb_build_object('application_id', v_row ->> 'application_id', 'decision', v_row ->> 'decision');
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), lower(TG_OP), TG_TABLE_NAME, v_entity_id, v_metadata);

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

DROP TRIGGER IF EXISTS audit_applications ON public.applications;
CREATE TRIGGER audit_applications
AFTER INSERT OR UPDATE OR DELETE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();

DROP TRIGGER IF EXISTS audit_admissions_decisions ON public.admissions_decisions;
CREATE TRIGGER audit_admissions_decisions
AFTER INSERT OR UPDATE OR DELETE ON public.admissions_decisions
FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();

DROP TRIGGER IF EXISTS audit_students ON public.students;
CREATE TRIGGER audit_students
AFTER INSERT OR UPDATE OR DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();

DROP TRIGGER IF EXISTS audit_enrollments ON public.enrollments;
CREATE TRIGGER audit_enrollments
AFTER INSERT OR UPDATE OR DELETE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();

DROP TRIGGER IF EXISTS audit_academic_terms ON public.academic_terms;
CREATE TRIGGER audit_academic_terms
AFTER INSERT OR UPDATE OR DELETE ON public.academic_terms
FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();

DROP TRIGGER IF EXISTS audit_courses ON public.courses;
CREATE TRIGGER audit_courses
AFTER INSERT OR UPDATE OR DELETE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();

DROP TRIGGER IF EXISTS audit_announcements ON public.announcements;
CREATE TRIGGER audit_announcements
AFTER INSERT OR UPDATE OR DELETE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();

-- Browser users use the RPCs/Edge Functions for state-changing workflows.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.applications FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.admissions_decisions FROM anon, authenticated;
REVOKE DELETE ON TABLE public.students, public.enrollments, public.audit_logs FROM anon, authenticated;
