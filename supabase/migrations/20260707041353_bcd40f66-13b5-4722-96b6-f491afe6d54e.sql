
-- 1) Hide correct_index from players
DROP POLICY IF EXISTS "Anyone auth can view questions of published banks" ON public.questions;

-- Play-safe question fetcher (no correct_index)
CREATE OR REPLACE FUNCTION public.get_play_questions(_bank_id uuid)
RETURNS TABLE (
  id uuid,
  bank_id uuid,
  prompt text,
  choices jsonb,
  points int,
  time_limit_sec int,
  order_index int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.bank_id, q.prompt, q.choices, q.points, q.time_limit_sec, q.order_index
  FROM public.questions q
  JOIN public.question_banks b ON b.id = q.bank_id
  WHERE q.bank_id = _bank_id
    AND b.is_published = true
    AND auth.uid() IS NOT NULL
  ORDER BY q.order_index ASC;
$$;

REVOKE EXECUTE ON FUNCTION public.get_play_questions(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_play_questions(uuid) TO authenticated;

-- Server-side answer check
CREATE OR REPLACE FUNCTION public.check_answer(_question_id uuid, _choice_index int)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.questions q
    JOIN public.question_banks b ON b.id = q.bank_id
    WHERE q.id = _question_id
      AND b.is_published = true
      AND q.correct_index = _choice_index
      AND auth.uid() IS NOT NULL
  );
$$;

REVOKE EXECUTE ON FUNCTION public.check_answer(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_answer(uuid, int) TO authenticated;

-- 2) Restrict published bank listing to guru/creator roles (or owner)
DROP POLICY IF EXISTS "Anyone auth can view published banks" ON public.question_banks;

CREATE POLICY "Gurus and creators can view published banks"
ON public.question_banks
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND (
    public.has_role(auth.uid(), 'guru'::public.app_role)
    OR public.has_role(auth.uid(), 'creator'::public.app_role)
  )
);

-- 3) Restrict rooms to their owning guru; players use a lookup function by code
DROP POLICY IF EXISTS "Anyone auth can view active rooms" ON public.rooms;

CREATE OR REPLACE FUNCTION public.get_room_by_code(_code text)
RETURNS TABLE (
  id uuid,
  code text,
  title text,
  theme text,
  status text,
  countdown_sec int,
  bank_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.code, r.title, r.theme, r.status, r.countdown_sec, r.bank_id
  FROM public.rooms r
  WHERE upper(r.code) = upper(_code)
    AND r.status IN ('lobby', 'live')
    AND auth.uid() IS NOT NULL
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_room_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_room_by_code(text) TO authenticated;
