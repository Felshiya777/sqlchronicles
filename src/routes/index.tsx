import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GHOSTLINE // SQL hacker game" },
      { name: "description", content: "Learn SQL the cyberpunk way — write queries, breach NEXACORP, free the city." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/play", replace: true });
  }, [loading, user, navigate]);

  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-between px-5 py-10 bg-grid">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        <p className="font-mono text-xs text-neon flicker">// GHOSTLINE NETWORK — secured channel established</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-mono leading-tight text-foreground">
          The city runs on <span className="text-neon glitch">data</span>.<br />
          You run on <span className="text-neon-magenta">SQL</span>.
        </h1>
        <p className="mt-5 text-sm text-muted-foreground font-mono leading-relaxed">
          NEXACORP owns the grid. We're the ghosts in their database.
          Five arcs. Twenty-five missions. Every query is a weapon.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/auth"
            className="rounded border border-neon bg-primary/10 px-5 py-3 text-center font-mono text-sm text-neon hover:bg-primary/20 transition"
          >▸ jack in</Link>
          <Link
            to="/auth"
            search={{ mode: "signup" } as never}
            className="rounded border border-border bg-card/60 px-5 py-3 text-center font-mono text-sm text-foreground hover:border-neon hover:text-neon transition"
          >+ new operator</Link>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 text-center">
          {[
            ["25", "missions"],
            ["5", "arcs"],
            ["∞", "trace risk"],
          ].map(([n, l]) => (
            <div key={l} className="terminal-frame rounded p-3">
              <div className="font-mono text-2xl text-neon">{n}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[10px] text-muted-foreground mt-8">
        // built for night shifts. headphones recommended.
      </p>
    </main>
  );
}
