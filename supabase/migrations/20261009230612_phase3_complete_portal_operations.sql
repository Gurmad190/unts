-- UNS Digital Portal Phase 3: complete university operations.
-- Additive only. Existing rows and Phase 1/2 boundaries are preserved.

CREATE TABLE IF NOT EXISTS public.branding_settings (
  id text PRIMARY KEY DEFAULT 'global',
  university_name text NOT NULL DEFAULT 'University of Northeastern Somalia',
  logo_url text,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.branding_settings (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branding_public_read ON public.branding_settings;
CREATE POLICY branding_public_read
  ON public.branding_settings FOR SELECT TO anon, authenticated
  USING (true);
DROP POLICY IF EXISTS branding_admin_write ON public.branding_settings;
CREATE POLICY branding_admin_write
  ON public.branding_settings FOR ALL TO authenticated
  USING (public.has_any_role(ARRAY['super_admin','admin']))
  WITH CHECK (public.has_any_role(ARRAY['super_admin','admin']));

-- Private buckets use signed URLs. Branding is public so the public website can
-- load the configured logo without exposing any service-role key.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', false),
  ('student-documents', 'student-documents', false),
  ('branding', 'branding', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS avatars_read ON storage.objects;
CREATE POLICY avatars_read
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      public.is_staff()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );
DROP POLICY IF EXISTS avatars_insert ON storage.objects;
CREATE POLICY avatars_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (
      public.has_any_role(ARRAY['super_admin','admin'])
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );
DROP POLICY IF EXISTS avatars_update ON storage.objects;
CREATE POLICY avatars_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      public.has_any_role(ARRAY['super_admin','admin'])
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (
      public.has_any_role(ARRAY['super_admin','admin'])
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );
DROP POLICY IF EXISTS avatars_delete ON storage.objects;
CREATE POLICY avatars_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      public.has_any_role(ARRAY['super_admin','admin'])
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS student_documents_read ON storage.objects;
CREATE POLICY student_documents_read
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-documents'
    AND (
      public.has_any_role(ARRAY['super_admin','admin','admissions'])
      OR EXISTS (
        SELECT 1
        FROM public.application_documents d
        JOIN public.applications ap ON ap.id = d.application_id
        JOIN public.students s ON s.applicant_id = ap.applicant_id
        WHERE d.storage_path = name
          AND s.profile_id = auth.uid()
      )
    )
  );
DROP POLICY IF EXISTS student_documents_insert ON storage.objects;
CREATE POLICY student_documents_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'student-documents'
    AND public.has_any_role(ARRAY['super_admin','admin','admissions'])
  );
DROP POLICY IF EXISTS student_documents_update ON storage.objects;
CREATE POLICY student_documents_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'student-documents' AND public.has_any_role(ARRAY['super_admin','admin','admissions']))
  WITH CHECK (bucket_id = 'student-documents' AND public.has_any_role(ARRAY['super_admin','admin','admissions']));
DROP POLICY IF EXISTS student_documents_delete ON storage.objects;
CREATE POLICY student_documents_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'student-documents' AND public.has_any_role(ARRAY['super_admin','admin','admissions']));

DROP POLICY IF EXISTS branding_read ON storage.objects;
CREATE POLICY branding_read
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'branding');
DROP POLICY IF EXISTS branding_insert ON storage.objects;
CREATE POLICY branding_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND public.has_any_role(ARRAY['super_admin','admin']));
DROP POLICY IF EXISTS branding_update ON storage.objects;
CREATE POLICY branding_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'branding' AND public.has_any_role(ARRAY['super_admin','admin']))
  WITH CHECK (bucket_id = 'branding' AND public.has_any_role(ARRAY['super_admin','admin']));
DROP POLICY IF EXISTS branding_delete ON storage.objects;
CREATE POLICY branding_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'branding' AND public.has_any_role(ARRAY['super_admin','admin']));

DROP POLICY IF EXISTS documents_self ON public.application_documents;
CREATE POLICY documents_self
  ON public.application_documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications ap
      JOIN public.applicants a ON a.id = ap.applicant_id
      WHERE ap.id = application_id
        AND lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
    OR EXISTS (
      SELECT 1
      FROM public.applications ap
      JOIN public.students s ON s.applicant_id = ap.applicant_id
      WHERE ap.id = application_id
        AND s.profile_id = auth.uid()
    )
    OR public.has_any_role(ARRAY['super_admin','admin','admissions'])
  );

CREATE OR REPLACE FUNCTION public.update_student_profile(
  p_student_id uuid,
  p_full_name text,
  p_phone text DEFAULT NULL,
  p_date_of_birth date DEFAULT NULL,
  p_nationality text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_program_id uuid DEFAULT NULL,
  p_admission_term_id uuid DEFAULT NULL
)
RETURNS TABLE(
  student_id uuid,
  full_name text,
  phone text,
  date_of_birth date,
  nationality text,
  address text,
  program_id uuid,
  admission_term_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_profile_id uuid;
  v_applicant_id uuid;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin','admin','registrar']) THEN
    RAISE EXCEPTION 'You are not authorised to edit student records' USING ERRCODE = '42501';
  END IF;
  IF nullif(trim(p_full_name), '') IS NULL THEN
    RAISE EXCEPTION 'Student name is required' USING ERRCODE = '22023';
  END IF;

  SELECT s.profile_id, s.applicant_id
  INTO v_profile_id, v_applicant_id
  FROM public.students s
  WHERE s.id = p_student_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET full_name = trim(p_full_name), phone = nullif(trim(p_phone), ''), updated_at = now()
    WHERE id = v_profile_id;
  END IF;

  IF v_applicant_id IS NOT NULL THEN
    UPDATE public.applicants
    SET full_name = trim(p_full_name), phone = nullif(trim(p_phone), ''), date_of_birth = p_date_of_birth,
        nationality = nullif(trim(p_nationality), ''), address = nullif(trim(p_address), ''), updated_at = now()
    WHERE id = v_applicant_id;
  END IF;

  UPDATE public.students
  SET program_id = COALESCE(p_program_id, program_id),
      admission_term_id = p_admission_term_id,
      updated_at = now()
  WHERE id = p_student_id;

  RETURN QUERY
  SELECT s.id, COALESCE(p.full_name, a.full_name), COALESCE(p.phone, a.phone), a.date_of_birth,
         a.nationality, a.address, s.program_id, s.admission_term_id
  FROM public.students s
  LEFT JOIN public.profiles p ON p.id = s.profile_id
  LEFT JOIN public.applicants a ON a.id = s.applicant_id
  WHERE s.id = p_student_id;
END;
$$;
REVOKE ALL ON FUNCTION public.update_student_profile(uuid, text, text, date, text, text, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_student_profile(uuid, text, text, date, text, text, uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_own_profile_avatar(p_avatar_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication is required' USING ERRCODE = '42501';
  END IF;
  IF p_avatar_path IS NOT NULL AND p_avatar_path NOT LIKE auth.uid()::text || '/%' THEN
    RAISE EXCEPTION 'Avatar path must belong to the signed-in user' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles SET avatar_url = p_avatar_path, updated_at = now() WHERE id = auth.uid();
  RETURN p_avatar_path;
END;
$$;
REVOKE ALL ON FUNCTION public.update_own_profile_avatar(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_own_profile_avatar(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_branding(
  p_university_name text,
  p_logo_url text DEFAULT NULL
)
RETURNS public.branding_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_branding public.branding_settings;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin','admin']) THEN
    RAISE EXCEPTION 'You are not authorised to manage branding' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.branding_settings (id, university_name, logo_url, updated_by, updated_at)
  VALUES ('global', COALESCE(NULLIF(trim(p_university_name), ''), 'University of Northeastern Somalia'), p_logo_url, auth.uid(), now())
  ON CONFLICT (id) DO UPDATE SET university_name = EXCLUDED.university_name, logo_url = EXCLUDED.logo_url,
    updated_by = EXCLUDED.updated_by, updated_at = now()
  RETURNING * INTO v_branding;
  RETURN v_branding;
END;
$$;
REVOKE ALL ON FUNCTION public.update_branding(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_branding(text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.register_student_course(
  p_student_id uuid,
  p_term_id uuid,
  p_course_id uuid
)
RETURNS TABLE(registration_id uuid, enrollment_id uuid, course_id uuid, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_enrollment_id uuid;
  v_program_id uuid;
  v_registration public.course_registrations;
BEGIN
  IF NOT (
    public.has_any_role(ARRAY['super_admin','admin','registrar','faculty'])
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = p_student_id AND s.profile_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You are not authorised to register this student' USING ERRCODE = '42501';
  END IF;

  SELECT e.id, e.program_id INTO v_enrollment_id, v_program_id
  FROM public.enrollments e
  WHERE e.student_id = p_student_id AND e.term_id = p_term_id AND e.status = 'enrolled';
  IF v_enrollment_id IS NULL THEN
    RAISE EXCEPTION 'The student must be enrolled in the selected academic term first' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = p_course_id AND c.active = true AND (c.program_id IS NULL OR c.program_id = v_program_id)
  ) THEN
    RAISE EXCEPTION 'The course is not active for this programme' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.course_registrations (enrollment_id, course_id, status)
  VALUES (v_enrollment_id, p_course_id, 'registered')
  ON CONFLICT (enrollment_id, course_id) DO UPDATE SET status = 'registered'
  RETURNING * INTO v_registration;

  RETURN QUERY SELECT v_registration.id, v_registration.enrollment_id, v_registration.course_id, v_registration.status;
END;
$$;
REVOKE ALL ON FUNCTION public.register_student_course(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_student_course(uuid, uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.drop_student_course(p_registration_id uuid)
RETURNS TABLE(registration_id uuid, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_registration public.course_registrations;
BEGIN
  IF NOT (
    public.has_any_role(ARRAY['super_admin','admin','registrar','faculty'])
    OR EXISTS (
      SELECT 1 FROM public.course_registrations cr
      JOIN public.enrollments e ON e.id = cr.enrollment_id
      JOIN public.students s ON s.id = e.student_id
      WHERE cr.id = p_registration_id AND s.profile_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'You are not authorised to drop this course' USING ERRCODE = '42501';
  END IF;
  UPDATE public.course_registrations SET status = 'dropped' WHERE id = p_registration_id RETURNING * INTO v_registration;
  IF v_registration.id IS NULL THEN RAISE EXCEPTION 'Course registration not found' USING ERRCODE = 'P0002'; END IF;
  RETURN QUERY SELECT v_registration.id, v_registration.status;
END;
$$;
REVOKE ALL ON FUNCTION public.drop_student_course(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.drop_student_course(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_course_grade(
  p_registration_id uuid,
  p_grade text,
  p_grade_points numeric,
  p_remarks text DEFAULT NULL
)
RETURNS TABLE(grade_id uuid, registration_id uuid, grade text, grade_points numeric, remarks text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_grade public.grades;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin','admin','registrar','faculty']) THEN
    RAISE EXCEPTION 'You are not authorised to record grades' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.grades (registration_id, grade, grade_points, submitted_at, remarks)
  VALUES (p_registration_id, p_grade, p_grade_points, now(), nullif(trim(p_remarks), ''))
  ON CONFLICT (registration_id) DO UPDATE SET grade = EXCLUDED.grade, grade_points = EXCLUDED.grade_points,
    submitted_at = now(), remarks = EXCLUDED.remarks, updated_at = now()
  RETURNING * INTO v_grade;
  UPDATE public.course_registrations SET status = 'completed' WHERE id = p_registration_id;
  RETURN QUERY SELECT v_grade.id, v_grade.registration_id, v_grade.grade, v_grade.grade_points, v_grade.remarks;
END;
$$;
REVOKE ALL ON FUNCTION public.record_course_grade(uuid, text, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_course_grade(uuid, text, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_invoice(
  p_student_id uuid,
  p_term_id uuid,
  p_invoice_number text,
  p_amount numeric,
  p_due_date date,
  p_description text DEFAULT NULL
)
RETURNS public.invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invoice public.invoices;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin','admin','finance']) THEN
    RAISE EXCEPTION 'You are not authorised to create invoices' USING ERRCODE = '42501';
  END IF;
  IF p_amount < 0 OR nullif(trim(p_invoice_number), '') IS NULL THEN
    RAISE EXCEPTION 'Invoice number and a non-negative amount are required' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.invoices (student_id, term_id, invoice_number, amount, due_date, status, description)
  VALUES (p_student_id, p_term_id, trim(p_invoice_number), p_amount, p_due_date, 'unpaid', nullif(trim(p_description), ''))
  RETURNING * INTO v_invoice;
  RETURN v_invoice;
END;
$$;
REVOKE ALL ON FUNCTION public.create_invoice(uuid, uuid, text, numeric, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invoice(uuid, uuid, text, numeric, date, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_reference text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(payment_id uuid, invoice_id uuid, invoice_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invoice public.invoices;
  v_payment public.payments;
  v_paid numeric;
  v_status text;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin','admin','finance']) THEN
    RAISE EXCEPTION 'You are not authorised to record payments' USING ERRCODE = '42501';
  END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Payment amount must be greater than zero' USING ERRCODE = '22023'; END IF;
  SELECT * INTO v_invoice FROM public.invoices WHERE id = p_invoice_id FOR UPDATE;
  IF v_invoice.id IS NULL THEN RAISE EXCEPTION 'Invoice not found' USING ERRCODE = 'P0002'; END IF;
  SELECT COALESCE(sum(amount), 0) INTO v_paid FROM public.payments WHERE invoice_id = p_invoice_id;
  IF v_paid + p_amount > v_invoice.amount THEN RAISE EXCEPTION 'Payment exceeds the invoice balance' USING ERRCODE = '22023'; END IF;
  INSERT INTO public.payments (invoice_id, student_id, amount, payment_method, reference, paid_at, recorded_by, notes)
  VALUES (p_invoice_id, v_invoice.student_id, p_amount, p_payment_method, nullif(trim(p_reference), ''), now(), auth.uid(), nullif(trim(p_notes), ''))
  RETURNING * INTO v_payment;
  v_status := CASE WHEN v_paid + p_amount >= v_invoice.amount THEN 'paid' ELSE 'partial' END;
  UPDATE public.invoices SET status = v_status, updated_at = now() WHERE id = p_invoice_id;
  RETURN QUERY SELECT v_payment.id, v_payment.invoice_id, v_status;
END;
$$;
REVOKE ALL ON FUNCTION public.record_payment(uuid, numeric, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_payment(uuid, numeric, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_application_document(
  p_application_id uuid,
  p_document_type text,
  p_storage_path text,
  p_file_name text
)
RETURNS public.application_documents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_document public.application_documents;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin','admin','admissions']) THEN
    RAISE EXCEPTION 'You are not authorised to upload student documents' USING ERRCODE = '42501';
  END IF;
  IF p_storage_path NOT LIKE p_application_id::text || '/%' THEN
    RAISE EXCEPTION 'Document path must be scoped to the application' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.application_documents (application_id, document_type, storage_path, file_name)
  VALUES (p_application_id, trim(p_document_type), p_storage_path, trim(p_file_name))
  RETURNING * INTO v_document;
  RETURN v_document;
END;
$$;
REVOKE ALL ON FUNCTION public.create_application_document(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_application_document(uuid, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_application_document(
  p_document_id uuid,
  p_status text
)
RETURNS public.application_documents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_document public.application_documents;
BEGIN
  IF NOT public.has_any_role(ARRAY['super_admin','admin','admissions']) THEN
    RAISE EXCEPTION 'You are not authorised to verify student documents' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('pending','verified','rejected') THEN RAISE EXCEPTION 'Invalid document status' USING ERRCODE = '22023'; END IF;
  UPDATE public.application_documents
  SET status = p_status, verified_at = CASE WHEN p_status = 'pending' THEN NULL ELSE now() END,
      verified_by = CASE WHEN p_status = 'pending' THEN NULL ELSE auth.uid() END
  WHERE id = p_document_id
  RETURNING * INTO v_document;
  IF v_document.id IS NULL THEN RAISE EXCEPTION 'Document not found' USING ERRCODE = 'P0002'; END IF;
  RETURN v_document;
END;
$$;
REVOKE ALL ON FUNCTION public.verify_application_document(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_application_document(uuid, text) TO authenticated;

-- Keep sensitive operations behind the RPCs above. Existing read policies remain.
REVOKE INSERT, UPDATE, DELETE ON public.application_documents, public.course_registrations, public.grades,
  public.invoices, public.payments, public.branding_settings FROM anon, authenticated;

-- Extend the existing append-only audit boundary to the newly surfaced workflows.
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();
DROP TRIGGER IF EXISTS audit_application_documents ON public.application_documents;
CREATE TRIGGER audit_application_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.application_documents
  FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();
DROP TRIGGER IF EXISTS audit_course_registrations ON public.course_registrations;
CREATE TRIGGER audit_course_registrations
  AFTER INSERT OR UPDATE OR DELETE ON public.course_registrations
  FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();
DROP TRIGGER IF EXISTS audit_grades ON public.grades;
CREATE TRIGGER audit_grades
  AFTER INSERT OR UPDATE OR DELETE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();
DROP TRIGGER IF EXISTS audit_invoices ON public.invoices;
CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();
DROP TRIGGER IF EXISTS audit_payments ON public.payments;
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();
DROP TRIGGER IF EXISTS audit_branding_settings ON public.branding_settings;
CREATE TRIGGER audit_branding_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.branding_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_portal_change();
