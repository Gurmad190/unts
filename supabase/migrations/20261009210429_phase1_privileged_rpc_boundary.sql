-- Privileged RPCs must require an authenticated caller. Their internal role
-- checks remain the authorization boundary.
REVOKE ALL ON FUNCTION public.admin_update_user(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text, text) TO authenticated;