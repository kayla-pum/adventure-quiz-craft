import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Plus, Copy, Play, Square, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/guru/rooms")({
  component: RoomsPage,
});

type Room = {
  id: string;
  title: string;
  code: string;
  status: string;
  countdown_sec: number;
  bank_id: string | null;
  theme: string;
  created_at: string;
};
type Bank = { id: string; title: string };

function genCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [bankId, setBankId] = useState<string>("");
  const [countdown, setCountdown] = useState(20);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const [{ data: rms, error }, { data: bks }] = await Promise.all([
      supabase.from("rooms").select("*").eq("guru_id", uid).order("created_at", { ascending: false }),
      supabase.from("question_banks").select("id,title").eq("is_published", true),
    ]);
    if (error) toast.error(error.message);
    setRooms((rms ?? []) as Room[]);
    setBanks((bks ?? []) as Bank[]);
    if (!bankId && bks && bks.length > 0) setBankId(bks[0].id);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (!bankId) {
      toast.error("Pilih bank soal (perlu bank yang sudah dipublish)");
      return;
    }
    setCreating(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;

    // retry a couple times if code collision
    let lastErr: any = null;
    for (let i = 0; i < 5; i++) {
      const code = genCode();
      const { error } = await supabase.from("rooms").insert({
        guru_id: uid,
        title: title.trim(),
        bank_id: bankId,
        countdown_sec: countdown,
        code,
        status: "lobby",
      });
      if (!error) {
        lastErr = null;
        break;
      }
      lastErr = error;
      if (!String(error.message).toLowerCase().includes("unique")) break;
    }
    setCreating(false);
    if (lastErr) return toast.error(lastErr.message);
    setTitle("");
    toast.success("Room dibuat");
    load();
  }

  async function setStatus(r: Room, status: string) {
    const { error } = await supabase.from("rooms").update({ status }).eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  }

  async function remove(r: Room) {
    if (!confirm(`Hapus room "${r.title}"?`)) return;
    const { error } = await supabase.from("rooms").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  }

  function copy(code: string) {
    navigator.clipboard.writeText(code);
    toast.success(`Kode ${code} disalin`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/50 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 size-4" /> Dashboard
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Room Pembelajaran</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 rounded-2xl bg-surface p-6 ring-1 ring-border">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Plus className="size-5 text-accent" /> Buat Room Baru
          </h2>
          <form onSubmit={createRoom} className="grid gap-3">
            <Input
              placeholder="Nama room (misal: Kuis Bab 3)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs text-muted-foreground">
                Bank Soal (published)
                <select
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                  className="h-9 rounded-md bg-background px-3 text-sm ring-1 ring-border outline-none focus:ring-brand/60"
                >
                  {banks.length === 0 && <option value="">— Belum ada bank published —</option>}
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-muted-foreground">
                Countdown per soal (detik)
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={countdown}
                  onChange={(e) => setCountdown(Number(e.target.value) || 20)}
                />
              </label>
            </div>
            <Button
              type="submit"
              disabled={creating || banks.length === 0}
              className="bg-accent text-accent-foreground hover:brightness-110"
            >
              {creating ? "Membuat…" : "Buat Room"}
            </Button>
          </form>
        </div>

        <h2 className="mb-4 text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          Room Milikku ({rooms.length})
        </h2>

        {loading ? (
          <div className="text-sm text-muted-foreground">Memuat…</div>
        ) : rooms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Belum ada room.
          </div>
        ) : (
          <div className="grid gap-3">
            {rooms.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4 ring-1 ring-border"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{r.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                        r.status === "live"
                          ? "bg-accent/20 text-accent"
                          : r.status === "ended"
                            ? "bg-secondary text-muted-foreground"
                            : "bg-brand/20 text-brand"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Countdown {r.countdown_sec}s
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copy(r.code)}
                    className="flex items-center gap-2 rounded-md bg-background px-3 py-1.5 font-mono text-sm font-bold tracking-widest ring-1 ring-border hover:ring-brand/60"
                    title="Salin kode"
                  >
                    {r.code} <Copy className="size-3.5" />
                  </button>
                  {r.status !== "live" ? (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(r, "live")}>
                      <Play className="mr-1 size-3.5" /> Mulai
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(r, "ended")}>
                      <Square className="mr-1 size-3.5" /> Akhiri
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(r)}>
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
