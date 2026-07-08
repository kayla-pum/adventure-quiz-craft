import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Plus, PencilRuler, Eye, EyeOff, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/creator/banks/")({
  component: BanksPage,
});

type Bank = {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  is_published: boolean;
  created_at: string;
};

function BanksPage() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from("question_banks")
      .select("*")
      .eq("creator_id", uid)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setBanks((data ?? []) as Bank[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from("question_banks")
      .insert({ creator_id: uid, title: title.trim(), description: desc.trim() || null })
      .select()
      .single();
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitle("");
    setDesc("");
    toast.success("Bank soal dibuat");
    navigate({ to: "/creator/banks/$bankId", params: { bankId: data.id } });
  }

  async function togglePublish(b: Bank) {
    const { error } = await supabase
      .from("question_banks")
      .update({ is_published: !b.is_published })
      .eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success(!b.is_published ? "Dipublish" : "Ditarik dari publish");
    load();
  }

  async function remove(b: Bank) {
    if (!confirm(`Hapus bank soal "${b.title}"?`)) return;
    const { error } = await supabase.from("question_banks").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus");
    load();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/50 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 size-4" /> Dashboard
            </Button>
          </Link>
          <h1 className="truncate text-base font-semibold sm:text-lg">Bank Soal</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8 rounded-2xl bg-surface p-6 ring-1 ring-border">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Plus className="size-5 text-brand" /> Buat Bank Soal Baru
          </h2>
          <form onSubmit={handleCreate} className="grid gap-3">
            <Input
              placeholder="Judul bank soal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              placeholder="Deskripsi (opsional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <Button
              type="submit"
              disabled={creating}
              className="bg-brand text-brand-foreground hover:brightness-110"
            >
              {creating ? "Membuat…" : "Buat & Isi Soal"}
            </Button>
          </form>
        </div>

        <h2 className="mb-4 text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          Milikku ({banks.length})
        </h2>

        {loading ? (
          <div className="text-sm text-muted-foreground">Memuat…</div>
        ) : banks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Belum ada bank soal. Buat yang pertama di atas.
          </div>
        ) : (
          <div className="grid gap-3">
            {banks.map((b) => (
              <div
                key={b.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-surface p-4 ring-1 ring-border sm:flex sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <PencilRuler className="size-4 shrink-0 text-brand" />
                    <span className="truncate font-medium">{b.title}</span>
                    {b.is_published && (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-accent">
                        Published
                      </span>
                    )}
                  </div>
                  {b.description && (
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {b.description}
                    </div>
                  )}
                </div>
                <div className="col-span-2 flex flex-wrap items-center justify-end gap-2 sm:col-span-1 sm:shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => togglePublish(b)}>
                    {b.is_published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                  <Link
                    to="/creator/banks/$bankId"
                    params={{ bankId: b.id }}
                  >
                    <Button size="sm" variant="secondary">
                      Kelola Soal
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => remove(b)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
