
-- Question Banks
CREATE TABLE public.question_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  theme text NOT NULL DEFAULT 'classroom',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_banks TO authenticated;
GRANT ALL ON public.question_banks TO service_role;

ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage own banks"
  ON public.question_banks FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id AND public.has_role(auth.uid(), 'creator'));

CREATE POLICY "Anyone auth can view published banks"
  ON public.question_banks FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE TRIGGER trg_question_banks_updated
  BEFORE UPDATE ON public.question_banks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Questions
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES public.question_banks(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  choices jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_index int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 100,
  time_limit_sec int NOT NULL DEFAULT 20,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage questions of own banks"
  ON public.questions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.question_banks b WHERE b.id = bank_id AND b.creator_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.question_banks b WHERE b.id = bank_id AND b.creator_id = auth.uid()));

CREATE POLICY "Anyone auth can view questions of published banks"
  ON public.questions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.question_banks b WHERE b.id = bank_id AND b.is_published = true));

CREATE TRIGGER trg_questions_updated
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Rooms
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_id uuid REFERENCES public.question_banks(id) ON DELETE SET NULL,
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  theme text NOT NULL DEFAULT 'classroom',
  countdown_sec int NOT NULL DEFAULT 20,
  status text NOT NULL DEFAULT 'lobby',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guru manage own rooms"
  ON public.rooms FOR ALL
  TO authenticated
  USING (auth.uid() = guru_id)
  WITH CHECK (auth.uid() = guru_id AND public.has_role(auth.uid(), 'guru'));

CREATE POLICY "Anyone auth can view active rooms"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (status IN ('lobby','live'));

CREATE TRIGGER trg_rooms_updated
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_questions_bank ON public.questions(bank_id, order_index);
CREATE INDEX idx_banks_creator ON public.question_banks(creator_id);
