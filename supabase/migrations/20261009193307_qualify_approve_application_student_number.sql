-- Qualify the student number column so it cannot conflict with the
-- approve_application return column named student_number.
CREATE OR REPLACE FUNCTION public.approve_application(p_application_id uuid, p_decision text, p_notes text DEFAULT NULL::text)
 RETURNS TABLE(application_id uuid, application_status text, student_id uuid, student_number text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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

  SELECT applicant_id, program_id, term_id
    INTO v_applicant_id, v_program_id, v_term_id
  FROM public.applications
  WHERE id = p_application_id
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

  UPDATE public.applications
  SET status = v_status, reviewed_at = now(), notes = p_notes, updated_at = now()
  WHERE id = p_application_id;

  IF p_decision = 'accepted' THEN
    SELECT id INTO v_profile_id
    FROM public.profiles p
    JOIN public.applicants a ON lower(p.email) = lower(a.email)
    WHERE a.id = v_applicant_id
    LIMIT 1;

    SELECT s.id, s.student_number INTO v_student_id, v_student_number
    FROM public.students s
    WHERE s.applicant_id = v_applicant_id OR (v_profile_id IS NOT NULL AND s.profile_id = v_profile_id)
    LIMIT 1;

    IF v_student_id IS NULL THEN
      LOOP
        v_student_number := format('UNS-%s-%s', to_char(current_date, 'YYYY'), upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.students WHERE students.student_number = v_student_number);
      END LOOP;

      INSERT INTO public.students (profile_id, applicant_id, student_number, program_id, admission_term_id, status, enrollment_date)
      VALUES (v_profile_id, v_applicant_id, v_student_number, v_program_id, v_term_id, 'active', current_date)
      RETURNING id INTO v_student_id;
    END IF;
  END IF;

  RETURN QUERY SELECT p_application_id, v_status, v_student_id, v_student_number;
END;
$function$;