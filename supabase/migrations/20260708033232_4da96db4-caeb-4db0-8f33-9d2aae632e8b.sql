-- has_role() is invoked inside RLS policies; authenticated users must be able to execute it,
-- otherwise all policies referencing it fail with permission denied (403).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;