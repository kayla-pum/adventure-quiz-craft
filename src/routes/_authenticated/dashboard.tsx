import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PencilRuler,
  GraduationCap,
  Swords,
  Snowflake,
  Zap,
  Shield,
  Play,
  Plus,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Role = "creator" | "guru" | "player";

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeRole, setActiveRole] = useState<Role>("player");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;
      setEmail(user.email ?? "");

      const [{ data: profile }, { data: userRoles }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);

      setDisplayName(profile?.display_name ?? user.email?.split("@")[0] ?? "");
      const r = (userRoles ?? []).map((x) => x.role as Role);
      setRoles(r);
      if (r.length > 0) setActiveRole(r[0]);
      setLoading(false);
    })();
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Sampai jumpa lagi!");
    navigate({ to: "/auth", replace: true });
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Memuat quest…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top HUD */}
      <header className="border-b border-border bg-surface/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-md bg-brand">
              <div className="size-4 rotate-45 bg-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">QUESTLMS</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase">
                {email}
              </div>
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-brand/20 text-sm font-bold text-brand ring-2 ring-brand/40">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Role switcher */}
        {roles.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Peran Aktif:
            </span>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all ${
                  activeRole === r
                    ? "bg-brand text-brand-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/15 via-transparent to-transparent p-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-brand uppercase">
            <Sparkles className="size-3" /> Ready Player One
          </div>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Selamat datang, {displayName}
          </h1>
          <p className="text-muted-foreground">
            {activeRole === "creator" && "Bangun bank soal dan publikasikan modul pembelajaran untuk semua player."}
            {activeRole === "guru" && "Kelola room, atur countdown, dan pantau performa player secara real-time."}
            {activeRole === "player" && "Pilih bank soal untuk practice, atau gabung room dengan kode dari guru."}
          </p>
        </div>

        {/* Role-specific dashboard */}
        {activeRole === "creator" && <CreatorDashboard />}
        {activeRole === "guru" && <GuruDashboard />}
        {activeRole === "player" && <PlayerDashboard />}
      </main>
    </div>
  );
}

/* -------------------- Role dashboards (UI-only placeholders) -------------------- */

function CreatorDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <StatCard label="Bank Soal" value="0" icon={<PencilRuler className="size-5" />} />
      <StatCard label="Total Pertanyaan" value="0" icon={<Sparkles className="size-5" />} />
      <StatCard label="Dipakai Player" value="0" icon={<Swords className="size-5" />} />

      <div className="lg:col-span-3">
        <div className="rounded-2xl bg-surface p-8 ring-1 ring-border">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bank Soal Kamu</h2>
            <Button className="bg-brand text-brand-foreground hover:brightness-110">
              <Plus className="mr-1 size-4" /> Buat Bank Soal
            </Button>
          </div>
          <EmptyState
            title="Belum ada bank soal"
            desc="Mulai bangun modul pertama untuk dipublikasikan ke Practice Mode."
          />
        </div>
      </div>
    </div>
  );
}

function GuruDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <StatCard label="Room Aktif" value="0" icon={<Play className="size-5" />} />
      <StatCard label="Total Player" value="0" icon={<GraduationCap className="size-5" />} />
      <StatCard label="Sesi Selesai" value="0" icon={<Shield className="size-5" />} />

      <div className="lg:col-span-3">
        <div className="rounded-2xl bg-surface p-8 ring-1 ring-border">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Room Pembelajaran</h2>
            <Button className="bg-accent text-accent-foreground hover:brightness-110">
              <Plus className="mr-1 size-4" /> Buat Room Baru
            </Button>
          </div>
          <EmptyState
            title="Belum ada room aktif"
            desc="Buat room, pilih bank soal, atur countdown, dan bagikan kode ke player."
          />
        </div>
      </div>
    </div>
  );
}

function PlayerDashboard() {
  const [code, setCode] = useState("");
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl bg-surface p-8 ring-1 ring-border">
        <h2 className="mb-1 text-xl font-semibold">Gabung Room</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Masukkan kode room dari guru untuk bertanding di Adventure Mode.
        </p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={8}
            className="flex-1 rounded-lg bg-background px-4 py-3 font-mono text-lg tracking-widest uppercase ring-1 ring-border outline-none focus:ring-brand/60"
          />
          <Button
            className="bg-brand text-brand-foreground hover:brightness-110"
            onClick={() => toast.info("Room feature coming soon!")}
          >
            <Play className="mr-1 size-4" /> Gabung
          </Button>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Loadout Adventure Mode
          </h3>
          <div className="flex gap-3">
            <SkillPreview icon={<Snowflake className="size-5" />} name="Freeze" color="text-arcade-sky ring-arcade-sky/40" />
            <SkillPreview icon={<Zap className="size-5" />} name="Double" color="text-accent ring-accent/40" />
            <SkillPreview icon={<Shield className="size-5" />} name="Shield" color="text-arcade-rose ring-arcade-rose/40" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-8 ring-1 ring-border">
        <h2 className="mb-1 text-xl font-semibold">Practice Mode</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Belajar mandiri dari bank soal publik.
        </p>
        <EmptyState title="Belum ada bank soal" desc="Bank soal dari Creator akan muncul di sini." compact />
      </div>
    </div>
  );
}

/* -------------------- Small pieces -------------------- */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface p-6 ring-1 ring-border">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
        <div className="grid size-8 place-items-center rounded-md bg-secondary text-brand">
          {icon}
        </div>
      </div>
      <div className="font-mono text-3xl font-bold">{value}</div>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  compact,
}: {
  title: string;
  desc: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`grid place-items-center rounded-xl border border-dashed border-border ${
        compact ? "py-8" : "py-16"
      } text-center`}
    >
      <div className="max-w-sm px-4">
        <div className="mb-2 text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function SkillPreview({
  icon,
  name,
  color,
}: {
  icon: React.ReactNode;
  name: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`grid size-14 place-items-center rounded-xl bg-secondary ring-2 ${color}`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        {name}
      </span>
    </div>
  );
}
