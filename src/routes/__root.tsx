import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "../integrations/supabase/client";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-bold text-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Quest tidak ditemukan
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang kamu cari sudah lenyap dari peta petualangan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:brightness-110"
          >
            Kembali ke lobi
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Sesuatu meledak di server
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kami tidak bisa memuat halaman ini. Coba lagi atau kembali ke lobi.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:brightness-110"
          >
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Ke lobi
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "QuestLMS — LMS Gamifikasi dengan Adventure Mode" },
      {
        name: "description",
        content:
          "Platform Learning Management System berbasis gamifikasi. Bank soal, live room, Adventure Mode dengan energi & skill Freeze, Double Arrow, Shield.",
      },
      { property: "og:title", content: "QuestLMS — LMS Gamifikasi dengan Adventure Mode" },
      {
        property: "og:description",
        content:
          "Ubah belajar menjadi petualangan epik. Practice Mode, live room, dan Adventure Mode kompetitif.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "QuestLMS — LMS Gamifikasi dengan Adventure Mode" },
      { name: "description", content: "Platform Learning Management System berbasis gamifikasi. Bank soal, live room, Adventure Mode dengan energi & skill Freeze, Double Arrow, Shield." },
      { property: "og:description", content: "Platform Learning Management System berbasis gamifikasi. Bank soal, live room, Adventure Mode dengan energi & skill Freeze, Double Arrow, Shield." },
      { name: "twitter:description", content: "Platform Learning Management System berbasis gamifikasi. Bank soal, live room, Adventure Mode dengan energi & skill Freeze, Double Arrow, Shield." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e0b5b73c-346e-42bc-b193-ee1533c6cc9a/id-preview-3bbf407b--025cb8e8-f915-4ed5-8b6e-1a22808695fc.lovable.app-1783313052937.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e0b5b73c-346e-42bc-b193-ee1533c6cc9a/id-preview-3bbf407b--025cb8e8-f915-4ed5-8b6e-1a22808695fc.lovable.app-1783313052937.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "USER_UPDATED"
      )
        return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
