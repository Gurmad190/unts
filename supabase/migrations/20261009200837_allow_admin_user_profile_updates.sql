-- Allow Admin users to manage ordinary portal profiles while keeping
-- Super Admin access protected from privilege escalation.
CREATE OR REPLACE FUNCTION public.admin_update_user(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_email text;
  v_profile_found boolean;
  v_super_admin_count integer;
  v_caller_is_super_admin boolean;
BEGIN
  v_caller_is_super_admin := has_role('super_admin'::text);

  IF NOT (v_caller_is_super_admin OR has_role('admin'::text)) THEN
    RAISE EXCEPTION 'Only an Admin or Super Admin can update portal users' USING ERRCODE = '42501';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own access role' USING ERRCODE = '42501';
  END IF;

  IF nullif(trim(coalesce(p_full_name, '')), '') IS NULL THEN
    RAISE EXCEPTION 'A full name is required' USING ERRCODE = '22023';
  END IF;

  IF p_role NOT IN ('super_admin', 'admin', 'admissions', 'registrar', 'faculty', 'finance', 'student', 'applicant') THEN
    RAISE EXCEPTION 'Unsupported portal role' USING ERRCODE = '22023';
  END IF;

  IF p_role = 'super_admin' AND NOT v_caller_is_super_admin THEN
    RAISE EXCEPTION 'Only a Super Admin can grant Super Admin access' USING ERRCODE = '42501';
  END IF;

  SELECT p.email, true
    INTO v_email, v_profile_found
  FROM public.profiles AS p
  WHERE p.id = p_user_id
  FOR UPDATE;

  IF NOT coalesce(v_profile_found, false) THEN
    RAISE EXCEPTION 'Portal profile not found' USING ERRCODE = 'P0002';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_roles AS ur
    WHERE ur.user_id = p_user_id
      AND ur.role = 'super_admin'
  ) AND NOT v_caller_is_super_admin THEN
    RAISE EXCEPTION 'Only a Super Admin can edit a Super Admin profile' USING ERRCODE = '42501';
  END IF;

  IF p_role <> 'super_admin' AND EXISTS (
    SELECT 1
    FROM public.user_roles AS ur
    WHERE ur.user_id = p_user_id
      AND ur.role = 'super_admin'
  ) THEN
    SELECT count(*)
      INTO v_super_admin_count
    FROM public.user_roles AS ur
    WHERE ur.role = 'super_admin';

    IF v_super_admin_count <= 1 THEN
      RAISE EXCEPTION 'Keep at least one Super Admin account active' USING ERRCODE = '42501';
    END IF;
  END IF;

  UPDATE public.profiles AS p
  SET full_name = trim(p_full_name),
      phone = nullif(trim(coalesce(p_phone, '')), ''),
      updated_at = now()
  WHERE p.id = p_user_id;

  DELETE FROM public.user_roles AS ur
  WHERE ur.user_id = p_user_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role);

  RETURN jsonb_build_object(
    'id', p_user_id,
    'full_name', trim(p_full_name),
    'email', v_email,
    'phone', nullif(trim(coalesce(p_phone, '')), ''),
    'role', p_role
  );
END;
$function$;