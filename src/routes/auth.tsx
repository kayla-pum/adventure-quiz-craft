import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilRuler, GraduationCap, Swords, ArrowLeft, Loader2 } from "lucide-react";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => searchSchema.parse(search),
  component: AuthPage,
});

type Role = "creator" | "guru" | "player";

const ROLE_OPTIONS: {
  id: Role;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    id: "creator",
    label: "Creator",
    desc: "Buat & publish bank soal",
    icon: PencilRuler,
    color: "text-brand ring-brand/50",
  },
  {
    id: "guru",
    label: "Guru",
    desc: "Buat room & atur kuis",
    icon: GraduationCap,
    color: "text-accent ring-accent/50",
  },
  {
    id: "player",
    label: "Player",
    desc: "Belajar & bertanding",
    icon: Swords,
    color: "text-arcade-sky ring-arcade-sky/50",
  },
];

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Email tidak valid" })
  .max(255);
const passwordSchema = z
  .string()
  .min(6, { message: "Password minimal 6 karakter" })
  .max(72);
const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Nama minimal 2 karakter" })
  .max(60);

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("player");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedEmail = emailSchema.parse(email);
      const parsedPassword = passwordSchema.parse(password);

      if (mode === "signup") {
        const parsedName = nameSchema.parse(displayName);
        const { error } = await supabase.auth.signUp({
          email: parsedEmail,
          password: parsedPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: parsedName, role },
          },
        });
        if (error) throw error;
        toast.success("Akun dibuat! Kamu sudah masuk.");
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail,
          password: parsedPassword,
        });
        if (error) throw error;
        toast.success("Selamat datang kembali!");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      const msg =
        err instanceof z.ZodError
          ? err.issues[0].message
          : err instanceof Error
            ? err.message
            : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Gagal masuk dengan Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Kembali ke lobi
        </Link>

        <div className="rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-md bg-brand">
              <div className="size-4 rotate-45 bg-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">QUESTLMS</span>
          </div>

          <div className="mb-6 flex rounded-lg bg-secondary p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama tampilan</Label>
                  <Input
                    id="name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Aris"
                    required
                    maxLength={60}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pilih peran</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLE_OPTIONS.map((r) => {
                      const Icon = r.icon;
                      const active = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`flex flex-col items-center gap-1.5 rounded-lg p-2 text-center text-xs ring-1 transition-all sm:gap-2 sm:p-3 ${
                            active
                              ? `bg-secondary ring-2 ${r.color}`
                              : "bg-background ring-border hover:ring-border/80"
                          }`}
                        >
                          <Icon className={`size-5 ${active ? r.color.split(" ")[0] : "text-muted-foreground"}`} />
                          <div className="min-w-0">
                            <div className="font-semibold">{r.label}</div>
                            <div className="hidden text-[10px] text-muted-foreground sm:block">{r.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                maxLength={72}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-brand-foreground hover:brightness-110"
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "signin" ? "Masuk" : "Buat Akun"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
              atau
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full"
          >
            Lanjutkan dengan Google
          </Button>
        </div>
      </div>
    </div>
  );
}
