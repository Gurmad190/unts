-- Backend-only grants for the Edge Functions. These keys never belong in browser code.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles, public.user_roles, public.departments, public.programs, public.academic_terms, public.applicants, public.applications, public.application_documents, public.admissions_decisions, public.students, public.announcements TO service_role;

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
AS $$
DECLARE
  v_applicant_id uuid;
  v_application_id uuid;
  v_application_number text;
BEGIN
  IF lower(trim(coalesce(p_email, ''))) = '' OR trim(coalesce(p_full_name, '')) = '' THEN
    RAISE EXCEPTION 'Full name and email are required' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.programs WHERE id = p_program_id AND active = true) THEN
    RAISE EXCEPTION 'The selected programme is not available' USING ERRCODE = '23503';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.academic_terms WHERE id = p_term_id) THEN
    RAISE EXCEPTION 'The selected academic term is not available' USING ERRCODE = '23503';
  END IF;

  INSERT INTO public.applicants (email, full_name, phone, date_of_birth, nationality, address)
  VALUES (lower(trim(p_email)), trim(p_full_name), nullif(trim(p_phone), ''), p_date_of_birth, nullif(trim(p_nationality), ''), nullif(trim(p_address), ''))
  ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    date_of_birth = EXCLUDED.date_of_birth,
    nationality = EXCLUDED.nationality,
    address = EXCLUDED.address,
    updated_at = now()
  RETURNING id INTO v_applicant_id;

  v_application_number := format('UNS-%s-%s', to_char(current_date, 'YYYY'), upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

  INSERT INTO public.applications (applicant_id, program_id, term_id, application_number, status)
  VALUES (v_applicant_id, p_program_id, p_term_id, v_application_number, 'applied')
  ON CONFLICT (applicant_id, program_id, term_id) DO UPDATE SET updated_at = now()
  RETURNING id, applications.application_number INTO v_application_id, v_application_number;

  RETURN QUERY SELECT v_application_id, v_application_number;
END;
$$;

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
AS $$
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
  ON CONFLICT (application_id) DO UPDATE SET
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

    SELECT id, student_number INTO v_student_id, v_student_number
    FROM public.students
    WHERE applicant_id = v_applicant_id OR (v_profile_id IS NOT NULL AND profile_id = v_profile_id)
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
$$;

GRANT EXECUTE ON FUNCTION public.approve_application(uuid, text, text) TO authenticated;

-- Starter catalog. Admins can edit these rows from the portal after deployment.
INSERT INTO public.departments (code, name, description)
VALUES
  ('TECH', 'Technology & Data Science', 'Computing, information technology, data and digital innovation.'),
  ('BUS', 'Business & Leadership', 'Management, finance, entrepreneurship and organisational leadership.'),
  ('HEALTH', 'Health Sciences', 'Professional health education, research and community practice.'),
  ('SOC', 'Social Sciences & Humanities', 'Society, culture, public policy, education and human development.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.programs (department_id, code, name, degree_level, duration_years, active)
SELECT d.id, p.code, p.name, p.degree_level, p.duration_years, true
FROM public.departments d
JOIN (VALUES
  ('TECH', 'BSC-CS', 'BSc Computer Science', 'undergraduate', 4::numeric),
  ('TECH', 'BSC-IT', 'BSc Information Technology', 'undergraduate', 4::numeric),
  ('TECH', 'MSC-DS', 'MSc Data Science', 'postgraduate', 2::numeric),
  ('BUS', 'BBA', 'Bachelor of Business Administration', 'undergraduate', 4::numeric),
  ('BUS', 'MBA', 'Master of Business Administration', 'postgraduate', 2::numeric),
  ('HEALTH', 'BSC-NUR', 'BSc Nursing', 'undergraduate', 4::numeric),
  ('HEALTH', 'MPH', 'Master of Public Health', 'postgraduate', 2::numeric),
  ('SOC', 'BA-POL', 'BA Political Science', 'undergraduate', 4::numeric),
  ('SOC', 'BA-SOC', 'BA Sociology', 'undergraduate', 4::numeric),
  ('SOC', 'MA-EDU', 'MA Education', 'postgraduate', 2::numeric)
) AS p(department_code, code, name, degree_level, duration_years) ON p.department_code = d.code
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.academic_terms (name, code, starts_on, ends_on, is_current)
SELECT 'Fall 2026', '2026-FALL', DATE '2026-09-01', DATE '2027-01-31', true
WHERE NOT EXISTS (SELECT 1 FROM public.academic_terms WHERE code = '2026-FALL');