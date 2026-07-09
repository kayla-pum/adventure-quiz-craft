REVOKE EXECUTE ON FUNCTION public.get_published_question_banks() FROM authenticated;

DROP POLICY IF EXISTS "Players can view published banks" ON public.question_banks;
CREATE POLICY "Players can view published banks"
ON public.question_banks
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND public.has_role(auth.uid(), 'player'::public.app_role)
);