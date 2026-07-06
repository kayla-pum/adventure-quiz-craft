import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Snowflake, Zap, Shield, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const THEMES = [
  { name: "Classroom", tint: "ring-brand/40 from-brand/20" },
  { name: "Space", tint: "ring-arcade-sky/40 from-arcade-sky/20" },
  { name: "Fantasy", tint: "ring-purple-400/40 from-purple-500/20" },
  { name: "Ocean", tint: "ring-blue-400/40 from-blue-500/20" },
  { name: "Anime", tint: "ring-arcade-rose/40 from-arcade-rose/20" },
  { name: "Halloween", tint: "ring-orange-500/40 from-orange-500/20" },
  { name: "Medieval", tint: "ring-amber-600/40 from-amber-700/20" },
];

const ROLES = [
  {
    tag: "Role: Creator",
    color: "text-brand",
    title: "Arsitek Pengetahuan",
    desc: "Bangun bank soal strategis dan publikasikan modul pembelajaran mandiri.",
  },
  {
    tag: "Role: Guru",
    color: "text-accent",
    title: "Game Master",
    desc: "Kendalikan arena kuis, atur countdown, dan pantau klasemen secara real-time.",
    highlight: true,
  },
  {
    tag: "Role: Player",
    color: "text-arcade-sky",
    title: "Ksatria Pelajar",
    desc: "Selesaikan quest, kumpulkan energi, dan aktifkan skill untuk memenangkan sesi.",
  },
];

function Landing() {
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand/30 selection:text-brand">
      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-brand">
            <div className="size-4 rotate-45 bg-background" />
          </div>
          <span className="text-xl font-semibold tracking-tight">QUESTLMS</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Masuk
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground ring-1 ring-brand transition-all hover:brightness-110"
          >
            Mulai Gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-32 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-brand uppercase">
          <Sparkles className="size-3" /> Adventure Mode Aktif
        </div>
        <h1 className="mx-auto mb-6 max-w-[20ch] text-balance text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
          Ubah Belajar Menjadi Petualangan Epik
        </h1>
        <p className="mx-auto mb-12 max-w-[52ch] text-pretty text-lg text-muted-foreground md:text-xl">
          Platform LMS gamifikasi di mana setiap kuis adalah pertarungan boss dan
          setiap materi adalah harta karun.
        </p>

        {/* Join code */}
        <div className="mx-auto mb-20 max-w-md">
          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-brand/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
            <div className="relative flex rounded-xl bg-surface p-2 ring-1 ring-border transition-all focus-within:ring-brand/60">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MASUKKAN KODE ROOM"
                maxLength={8}
                className="flex-1 border-none bg-transparent px-4 font-mono text-lg tracking-widest uppercase outline-none placeholder:text-muted-foreground/60"
              />
              <Link
                to="/auth"
                className="flex items-center gap-2 rounded-lg bg-brand py-2 pr-4 pl-3 text-sm font-semibold text-brand-foreground transition-all hover:brightness-110"
              >
                <Play className="size-4" /> GABUNG
              </Link>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Belum punya kode? <Link to="/auth" className="text-brand hover:underline">Masuk sebagai Player</Link> untuk practice mode.
          </p>
        </div>

        {/* Roles */}
        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
          {ROLES.map((r) => (
            <div
              key={r.title}
              className={`rounded-2xl p-6 ring-1 transition-colors ${
                r.highlight
                  ? "bg-secondary/60 ring-border hover:ring-border/60"
                  : "bg-surface ring-border/60 hover:ring-border"
              }`}
            >
              <span
                className={`mb-4 block text-[10px] font-semibold tracking-widest uppercase ${r.color}`}
              >
                {r.tag}
              </span>
              <h3 className="mb-2 text-xl font-medium">{r.title}</h3>
              <p className="text-pretty text-sm text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Adventure Mode HUD */}
      <section className="border-y border-border bg-surface/40 px-6 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="mb-3 inline-block text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
              Fitur Unggulan
            </span>
            <h2 className="mb-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Adventure Mode — Strategi di Atas Segalanya
            </h2>
            <p className="mb-8 max-w-[42ch] text-pretty text-lg text-muted-foreground">
              Bukan sekadar kuis biasa. Setiap tiga jawaban benar mengisi Bar
              Energi. Gunakan skill secara taktis untuk mendominasi papan
              peringkat.
            </p>
            <div className="flex flex-col gap-4">
              <SkillRow
                icon={<Snowflake className="size-5" />}
                color="text-arcade-sky"
                name="Freeze"
                desc="Hentikan waktu lawan selama 5 detik."
              />
              <SkillRow
                icon={<Zap className="size-5" />}
                color="text-accent"
                name="Double Arrow"
                desc="Poin 2× lipat untuk soal berikutnya."
              />
              <SkillRow
                icon={<Shield className="size-5" />}
                color="text-arcade-rose"
                name="Shield"
                desc="Kebal dari satu jawaban salah."
              />
            </div>
          </div>

          {/* HUD Mockup */}
          <div className="relative overflow-hidden rounded-3xl bg-background p-8 shadow-2xl ring-1 ring-border">
            <div className="absolute top-4 right-4">
              <div className="rounded-full bg-secondary/80 px-3 py-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase ring-1 ring-border backdrop-blur">
                Live Session
              </div>
            </div>

            <div className="space-y-8 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold tracking-widest text-brand uppercase">
                  <span>Energy Core</span>
                  <span>85%</span>
                </div>
                <div className="h-4 rounded-full bg-secondary p-1">
                  <div className="energy-gradient h-full w-[85%] rounded-full" />
                </div>
              </div>

              <div className="rounded-2xl bg-surface p-6 ring-1 ring-border">
                <p className="mb-2 text-sm text-muted-foreground">Pertanyaan 12/20</p>
                <h4 className="mb-6 text-lg font-medium">
                  Manakah struktur data non-linear?
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary p-3 text-sm ring-1 ring-border">Array</div>
                  <div className="rounded-lg bg-brand/10 p-3 text-sm text-brand ring-1 ring-brand/40">
                    Graph
                  </div>
                  <div className="rounded-lg bg-secondary p-3 text-sm ring-1 ring-border">Stack</div>
                  <div className="rounded-lg bg-secondary p-3 text-sm ring-1 ring-border">Queue</div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <SkillSlot icon={<Snowflake className="size-6" />} ring="ring-arcade-sky/50" color="text-arcade-sky" />
                <SkillSlot icon={<Zap className="size-6" />} ring="ring-accent/50" color="text-accent" />
                <SkillSlot icon={<Shield className="size-6" />} ring="ring-arcade-rose/40" color="text-arcade-rose" disabled />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-2 block text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Customization
            </span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Dunia Anda, Aturan Anda
            </h2>
          </div>
          <p className="max-w-[30ch] text-right text-sm text-muted-foreground">
            7 tema visual untuk pengalaman imersif.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {THEMES.map((t) => (
            <div key={t.name} className="group cursor-pointer">
              <div
                className={`mb-3 grid aspect-[2/3] w-full place-items-center overflow-hidden rounded-xl bg-gradient-to-br to-transparent ring-1 transition-all group-hover:scale-[1.02] ${t.tint}`}
              >
                <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  {t.name}
                </span>
              </div>
              <p className="text-center text-xs font-medium text-muted-foreground">
                {t.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <div className="rounded-3xl border border-brand/30 bg-gradient-to-b from-brand/10 to-transparent p-12">
          <h3 className="mb-4 text-3xl font-semibold tracking-tight">
            Siap memulai quest pertamamu?
          </h3>
          <p className="mb-8 text-muted-foreground">
            Daftar gratis. Pilih peranmu — Creator, Guru, atau Player.
          </p>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:brightness-110"
          >
            Buat akun <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded bg-secondary">
              <div className="size-3 rotate-45 bg-brand" />
            </div>
            <span className="font-semibold tracking-tight">QUESTLMS</span>
          </div>
          <div className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            &copy; 2026 QuestLMS Studio
          </div>
        </div>
      </footer>
    </div>
  );
}

function SkillRow({
  icon,
  color,
  name,
  desc,
}: {
  icon: React.ReactNode;
  color: string;
  name: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`grid size-12 place-items-center rounded-lg bg-secondary ring-1 ring-border ${color}`}
      >
        {icon}
      </div>
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function SkillSlot({
  icon,
  ring,
  color,
  disabled,
}: {
  icon: React.ReactNode;
  ring: string;
  color: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`skill-slot grid size-14 cursor-pointer place-items-center rounded-xl bg-secondary ring-2 ${ring} ${color} ${
        disabled ? "opacity-40" : ""
      }`}
    >
      {icon}
    </div>
  );
}
