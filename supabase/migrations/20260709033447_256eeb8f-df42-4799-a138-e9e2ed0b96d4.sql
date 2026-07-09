CREATE OR REPLACE FUNCTION public.get_published_question_banks()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  theme text,
  question_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.title, b.description, b.theme, count(q.id) AS question_count
  FROM public.question_banks b
  JOIN public.questions q ON q.bank_id = b.id
  WHERE b.is_published = true
    AND auth.uid() IS NOT NULL
  GROUP BY b.id, b.title, b.description, b.theme
  ORDER BY b.created_at DESC;
$$;

REVOKE EXECUTE ON FUNCTION public.get_published_question_banks() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_published_question_banks() TO authenticated;

CREATE OR REPLACE FUNCTION public.publish_bank_when_first_question_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.question_banks
  SET is_published = true
  WHERE id = NEW.bank_id
    AND is_published = false
    AND EXISTS (
      SELECT 1 FROM public.questions q WHERE q.bank_id = NEW.bank_id
    );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_bank_when_first_question_added() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_bank_when_first_question_added() TO service_role;

DROP TRIGGER IF EXISTS trg_publish_bank_when_first_question_added ON public.questions;
CREATE TRIGGER trg_publish_bank_when_first_question_added
  AFTER INSERT ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.publish_bank_when_first_question_added();