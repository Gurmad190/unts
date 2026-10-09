-- Add an atomic, server-authorized workflow for editing a portal profile
-- and replacing its assigned role.
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
BEGIN
  IF NOT has_role('super_admin'::text) THEN
    RAISE EXCEPTION 'Only a Super Admin can update portal users' USING ERRCODE = '42501';
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

  SELECT p.email, true
    INTO v_email, v_profile_found
  FROM public.profiles AS p
  WHERE p.id = p_user_id
  FOR UPDATE;

  IF NOT coalesce(v_profile_found, false) THEN
    RAISE EXCEPTION 'Portal profile not found' USING ERRCODE = 'P0002';
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

GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text, text) TO authenticated;