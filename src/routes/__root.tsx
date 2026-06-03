import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";
import { GameToaster } from "@/components/GameToaster";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="terminal-frame rounded-md p-8 text-center max-w-md">
        <h1 className="text-6xl font-mono text-neon glitch">404</h1>
        <p className="mt-3 text-sm text-muted-foreground font-mono">// signal lost in the rain</p>
        <Link to="/" className="mt-6 inline-block rounded border border-neon px-4 py-2 text-sm font-mono text-neon hover:bg-primary/10">
          ← return to ghostline
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="terminal-frame rounded-md p-8 max-w-md text-center">
        <h1 className="text-xl font-mono text-neon-magenta">// system corrupted</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded border border-neon px-4 py-2 text-sm font-mono text-neon hover:bg-primary/10"
        >reboot terminal</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "GHOSTLINE // learn SQL by hacking NEXACORP" },
      { name: "description", content: "Story-driven cyberpunk game that teaches SQL from beginner to advanced. Run real queries to take down the megacorp." },
      { name: "theme-color", content: "#0a0a1f" },
      { property: "og:title", content: "GHOSTLINE // SQL hacker game" },
      { property: "og:description", content: "Cyberpunk SQL adventure. Real SQLite, 5 arcs, 25 missions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function AuthInvalidator() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInvalidator />
      <Outlet />
      <GameToaster />
    </QueryClientProvider>
  );
}
