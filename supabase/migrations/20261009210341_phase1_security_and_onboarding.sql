-- Phase 1 security and onboarding hardening.
-- Additive/reversible controls only: no data deletion or table reset.

CREATE OR REPLACE FUNCTION public.submit_application(
  p_email text,
  p_full_name text,
  p_phone text,
  p_date_of_birth date,
  p_nationality text,
  p_address text,
  p_program_id uuid,
  p_term_id uuid
)
RETURNS TABLE(application_id uuid, application_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_applicant_id uuid;
  v_application_id uuid;
  v_application_number text;
BEGIN
  IF lower(trim(coalesce(p_email, ''))) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
     OR trim(coalesce(p_full_name, '')) = '' THEN
    RAISE EXCEPTION 'A valid full name and email are required' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.programs
    WHERE id = p_program_id AND active = true
  ) THEN
    RAISE EXCEPTION 'The selected programme is not available' USING ERRCODE = '23503';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.academic_terms
    WHERE id = p_term_id AND is_current = true
  ) THEN
    RAISE EXCEPTION 'The selected academic term is not currently accepting applications' USING ERRCODE = '23503';
  END IF;

  SELECT a.id
    INTO v_applicant_id
  FROM public.applicants AS a
  WHERE a.email = lower(trim(p_email));

  IF v_applicant_id IS NULL THEN
    INSERT INTO public.applicants (email, full_name, phone, date_of_birth, nationality, address)
    VALUES (
      lower(trim(p_email)),
      trim(p_full_name),
      nullif(trim(coalesce(p_phone, '')), ''),
      p_date_of_birth,
      nullif(trim(coalesce(p_nationality, '')), ''),
      nullif(trim(coalesce(p_address, '')), '')
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_applicant_id;

    IF v_applicant_id IS NULL THEN
      SELECT a.id
        INTO v_applicant_id
      FROM public.applicants AS a
      WHERE a.email = lower(trim(p_email));
    END IF;
  END IF;

  IF v_applicant_id IS NULL THEN
    RAISE EXCEPTION 'Could not create or find the applicant record' USING ERRCODE = 'P0001';
  END IF;

  v_application_number := format(
    'UNS-%s-%s',
    to_char(current_date, 'YYYY'),
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  );

  INSERT INTO public.applications (applicant_id, program_id, term_id, application_number, status)
  VALUES (v_applicant_id, p_program_id, p_term_id, v_application_number, 'applied')
  ON CONFLICT (applicant_id, program_id, term_id) DO NOTHING
  RETURNING id, applications.application_number INTO v_application_id, v_application_number;

  IF v_application_id IS NULL THEN
    SELECT ap.id, ap.application_number
      INTO v_application_id, v_application_number
    FROM public.applications AS ap
    WHERE ap.applicant_id = v_applicant_id
      AND ap.program_id = p_program_id
      AND ap.term_id = p_term_id;
  END IF;

  RETURN QUERY SELECT v_application_id, v_application_number;
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_application(text, text, text, date, text, text, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_application(text, text, text, date, text, text, uuid, uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.approve_application(
  p_application_id uuid,
  p_decision text,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(application_id uuid, application_status text, student_id uuid, student_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_applicant_id uuid;
  v_program_id uuid;
  v_term_id uuid;
  v_profile_id uuid;
  v_student_id uuid;
  v_student_number text;
  v_status text;
BEGIN
  IF NOT has_any_role(ARRAY['super_admin', 'admin', 'admissions']::text[]) THEN
    RAISE EXCEPTION 'You are not authorised to approve applications' USING ERRCODE = '42501';
  END IF;

  IF p_decision NOT IN ('accepted', 'rejected', 'waitlisted') THEN
    RAISE EXCEPTION 'Unsupported admission decision' USING ERRCODE = '22023';
  END IF;

  SELECT a.applicant_id, a.program_id, a.term_id
    INTO v_applicant_id, v_program_id, v_term_id
  FROM public.applications AS a
  WHERE a.id = p_application_id
  FOR UPDATE;

  IF v_applicant_id IS NULL THEN
    RAISE EXCEPTION 'Application not found' USING ERRCODE = 'P0002';
  END IF;

  v_status := p_decision;

  INSERT INTO public.admissions_decisions (application_id, decided_by, decision, notes)
  VALUES (p_application_id, auth.uid(), p_decision, p_notes)
  ON CONFLICT ON CONSTRAINT admissions_decisions_application_id_key DO UPDATE SET
    decided_by = EXCLUDED.decided_by,
    decision = EXCLUDED.decision,
    decision_date = now(),
    notes = EXCLUDED.notes;

  UPDATE public.applications AS a
  SET status = v_status,
      reviewed_at = now(),
      notes = p_notes,
      updated_at = now()
  WHERE a.id = p_application_id;

  IF p_decision = 'accepted' THEN
    SELECT p.id
      INTO v_profile_id
    FROM public.profiles AS p
    JOIN public.applicants AS ap
      ON lower(trim(p.email)) = lower(trim(ap.email))
    WHERE ap.id = v_applicant_id
    LIMIT 1;

    IF v_profile_id IS NULL THEN
      RAISE EXCEPTION 'No portal profile found for the approved applicant' USING ERRCODE = 'P0002';
    END IF;

    SELECT s.id, s.student_number
      INTO v_student_id, v_student_number
    FROM public.students AS s
    WHERE s.applicant_id = v_applicant_id
       OR s.profile_id = v_profile_id
    LIMIT 1;

    IF v_student_id IS NULL THEN
      LOOP
        v_student_number := format(
          'UNS-%s-%s',
          to_char(current_date, 'YYYY'),
          upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
        );
        EXIT WHEN NOT EXISTS (
          SELECT 1 FROM public.students
          WHERE students.student_number = v_student_number
        );
      END LOOP;

      INSERT INTO public.students (
        profile_id, applicant_id, student_number, program_id,
        admission_term_id, status, enrollment_date
      )
      VALUES (
        v_profile_id, v_applicant_id, v_student_number, v_program_id,
        v_term_id, 'active', current_date
      )
      RETURNING id INTO v_student_id;
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_profile_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN QUERY SELECT p_application_id, v_status, v_student_id, v_student_number;
END;
$function$;

REVOKE ALL ON FUNCTION public.approve_application(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_application(uuid, text, text) TO authenticated;

INSERT INTO public.user_roles (user_id, role)
SELECT s.profile_id, 'student'
FROM public.students AS s
WHERE s.profile_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

DROP POLICY IF EXISTS profiles_admin ON public.profiles;

CREATE POLICY profiles_super_admin_all
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.has_role('super_admin'::text))
  WITH CHECK (public.has_role('super_admin'::text));

CREATE POLICY profiles_admin_ordinary_update
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role('admin'::text)
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles AS ur
      WHERE ur.user_id = profiles.id AND ur.role = 'super_admin'
    )
  )
  WITH CHECK (
    public.has_role('admin'::text)
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles AS ur
      WHERE ur.user_id = profiles.id AND ur.role = 'super_admin'
    )
  );

CREATE OR REPLACE FUNCTION public.prevent_profile_email_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email
     AND coalesce(current_setting('request.jwt.claim.role', true), '') NOT IN ('service_role', 'supabase_admin')
     AND NOT public.has_role('super_admin'::text) THEN
    RAISE EXCEPTION 'Profile email changes are not permitted' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.prevent_profile_email_change() FROM PUBLIC;
DROP TRIGGER IF EXISTS prevent_profile_email_change ON public.profiles;
CREATE TRIGGER prevent_profile_email_change
  BEFORE UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_email_change();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = now();
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_key
  ON public.profiles (lower(trim(email)))
  WHERE email IS NOT NULL;

REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
  ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.prevent_last_super_admin_change() FROM PUBLIC;