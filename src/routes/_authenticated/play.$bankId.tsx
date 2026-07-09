import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/play/$bankId")({
  component: PracticePage,
});

type PlayQuestion = {
  id: string;
  bank_id: string;
  prompt: string;
  choices: string[];
  points: number;
  time_limit_sec: number;
  order_index: number;
};

function PracticePage() {
  const { bankId } = Route.useParams();
  const [bankTitle, setBankTitle] = useState("");
  const [questions, setQuestions] = useState<PlayQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const question = questions[current];
  const finished = questions.length > 0 && current >= questions.length;
  const progress = useMemo(() => {
    if (questions.length === 0) return "0 / 0";
    return `${Math.min(current + 1, questions.length)} / ${questions.length}`;
  }, [current, questions.length]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: bank }, { data: qs, error }] = await Promise.all([
        supabase
          .from("question_banks")
          .select("title")
          .eq("id", bankId)
          .maybeSingle(),
        supabase.rpc("get_play_questions", { _bank_id: bankId }),
      ]);

      if (error) toast.error(error.message);
      setBankTitle(bank?.title ?? "Practice Mode");
      setQuestions(
        (qs ?? []).map((q) => ({
          ...q,
          choices: Array.isArray(q.choices) ? q.choices.map(String) : [],
        })),
      );
      setCurrent(0);
      setSelected(null);
      setResult(null);
      setScore(0);
      setLoading(false);
    })();
  }, [bankId]);

  async function answer(choiceIndex: number) {
    if (!question || checking || result !== null) return;
    setSelected(choiceIndex);
    setChecking(true);
    const { data, error } = await supabase.rpc("check_answer", {
      _question_id: question.id,
      _choice_index: choiceIndex,
    });
    setChecking(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const isCorrect = Boolean(data);
    setResult(isCorrect);
    if (isCorrect) setScore((value) => value + question.points);
  }

  function next() {
    setCurrent((value) => value + 1);
    setSelected(null);
    setResult(null);
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setResult(null);
    setScore(0);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 size-4" /> Dashboard
            </Button>
          </Link>
          <h1 className="truncate text-base font-semibold sm:text-lg">{bankTitle || "Memuat…"}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <div className="text-sm text-muted-foreground">Memuat soal…</div>
        ) : questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Belum ada soal yang bisa dimainkan.
          </div>
        ) : finished ? (
          <div className="rounded-2xl bg-surface p-6 text-center ring-1 ring-border sm:p-10">
            <div className="mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Selesai
            </div>
            <h2 className="mb-3 text-2xl font-semibold sm:text-3xl">Skor kamu {score}</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Kamu sudah menyelesaikan {questions.length} soal.
            </p>
            <Button onClick={restart} className="bg-brand text-brand-foreground hover:brightness-110">
              <RotateCcw className="mr-1 size-4" /> Ulangi
            </Button>
          </div>
        ) : question ? (
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Soal {progress}
              </div>
              <div className="rounded-full bg-secondary px-3 py-1 font-mono text-xs font-bold text-brand ring-1 ring-border">
                {score} pts
              </div>
            </div>

            <h2 className="mb-6 text-xl font-semibold leading-snug sm:text-2xl">{question.prompt}</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {question.choices.map((choice, index) => {
                const active = selected === index;
                const showCorrect = active && result === true;
                const showWrong = active && result === false;
                return (
                  <button
                    key={`${question.id}-${index}`}
                    type="button"
                    disabled={checking || result !== null}
                    onClick={() => answer(index)}
                    className={`flex min-h-16 items-center gap-3 rounded-xl bg-background p-4 text-left text-sm ring-1 transition-colors disabled:cursor-default sm:text-base ${
                      showCorrect
                        ? "ring-accent bg-accent/15"
                        : showWrong
                          ? "ring-destructive bg-destructive/10"
                          : active
                            ? "ring-brand/60"
                            : "ring-border hover:ring-brand/60"
                    }`}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary font-mono text-xs font-bold text-muted-foreground">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="min-w-0 flex-1 text-pretty">{choice}</span>
                    {showCorrect && <CheckCircle2 className="size-5 shrink-0 text-accent" />}
                    {showWrong && <XCircle className="size-5 shrink-0 text-destructive" />}
                  </button>
                );
              })}
            </div>

            {result !== null && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className={`text-sm font-medium ${result ? "text-accent" : "text-destructive"}`}>
                  {result ? "Jawaban benar" : "Jawaban belum tepat"}
                </div>
                <Button onClick={next} className="bg-brand text-brand-foreground hover:brightness-110">
                  {current + 1 === questions.length ? "Lihat Skor" : "Soal Berikutnya"}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}