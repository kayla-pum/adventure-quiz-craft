import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/creator/banks/$bankId")({
  component: BankDetail,
});

type Question = {
  id: string;
  bank_id: string;
  prompt: string;
  choices: string[];
  correct_index: number;
  points: number;
  time_limit_sec: number;
  order_index: number;
};

function BankDetail() {
  const { bankId } = Route.useParams();
  const [bankTitle, setBankTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: bank }, { data: qs, error }] = await Promise.all([
      supabase.from("question_banks").select("title").eq("id", bankId).maybeSingle(),
      supabase
        .from("questions")
        .select("*")
        .eq("bank_id", bankId)
        .order("order_index", { ascending: true }),
    ]);
    if (error) toast.error(error.message);
    setBankTitle(bank?.title ?? "");
    setQuestions(
      (qs ?? []).map((q: any) => ({
        ...q,
        choices: Array.isArray(q.choices) ? q.choices : [],
      })),
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [bankId]);

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = choices.map((c) => c.trim()).filter(Boolean);
    if (!prompt.trim() || cleaned.length < 2) {
      toast.error("Isi pertanyaan dan minimal 2 pilihan");
      return;
    }
    if (correct >= cleaned.length) {
      toast.error("Pilih jawaban yang benar");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("questions").insert({
      bank_id: bankId,
      prompt: prompt.trim(),
      choices: cleaned,
      correct_index: correct,
      order_index: questions.length,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    setPrompt("");
    setChoices(["", "", "", ""]);
    setCorrect(0);
    toast.success("Soal ditambahkan");
    load();
  }

  async function remove(q: Question) {
    if (!confirm("Hapus soal ini?")) return;
    const { error } = await supabase.from("questions").delete().eq("id", q.id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/50 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/creator/banks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 size-4" /> Bank Soal
            </Button>
          </Link>
          <h1 className="truncate text-base font-semibold sm:text-lg">{bankTitle || "Memuat…"}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8 rounded-2xl bg-surface p-6 ring-1 ring-border">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Plus className="size-5 text-brand" /> Tambah Soal
          </h2>
          <form onSubmit={addQuestion} className="grid gap-3">
            <Input
              placeholder="Pertanyaan"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
            <div className="grid gap-2 sm:grid-cols-2">
              {choices.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrect(i)}
                    className={`grid size-8 shrink-0 place-items-center rounded-md ring-1 transition-colors ${
                      correct === i
                        ? "bg-accent text-accent-foreground ring-accent"
                        : "bg-secondary text-muted-foreground ring-border"
                    }`}
                    title="Tandai sebagai jawaban benar"
                  >
                    {correct === i ? <Check className="size-4" /> : String.fromCharCode(65 + i)}
                  </button>
                  <Input
                    placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                    value={c}
                    onChange={(e) => {
                      const next = [...choices];
                      next[i] = e.target.value;
                      setChoices(next);
                    }}
                  />
                </div>
              ))}
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-brand text-brand-foreground hover:brightness-110"
            >
              {saving ? "Menyimpan…" : "Simpan Soal"}
            </Button>
          </form>
        </div>

        <h2 className="mb-4 text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          Daftar Soal ({questions.length})
        </h2>

        {loading ? (
          <div className="text-sm text-muted-foreground">Memuat…</div>
        ) : questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Belum ada soal.
          </div>
        ) : (
          <div className="grid gap-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-xl bg-surface p-4 ring-1 ring-border">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                      Soal {idx + 1}
                    </div>
                    <div className="mt-1 font-medium">{q.prompt}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(q)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-1 sm:grid-cols-2">
                  {q.choices.map((c, i) => (
                    <div
                      key={i}
                      className={`rounded-md px-3 py-2 text-sm ring-1 ${
                        i === q.correct_index
                          ? "bg-accent/15 text-accent-foreground ring-accent/40"
                          : "bg-secondary/50 ring-border"
                      }`}
                    >
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
