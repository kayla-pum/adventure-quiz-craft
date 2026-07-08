-- Lock down SECURITY DEFINER functions: revoke broad EXECUTE, keep only what's needed
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_answer(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_play_questions(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_room_by_code(text) FROM PUBLIC, anon;

-- These are needed by signed-in players/gurus
GRANT EXECUTE ON FUNCTION public.check_answer(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_play_questions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_room_by_code(text) TO authenticated;