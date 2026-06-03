import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ARCS, getRankForXp } from "@/game/content";
import { LogOut, Lock, Check, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/play")({
  head: () => ({ meta: [{ title: "Ghostline HQ // mission select" }] }),
  component: Play,
});

function Play() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const { data: completed = [] } = useQuery({
    queryKey: ["progress", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("mission_progress").select("mission_id").eq("user_id", user.id);
      return (data ?? []).map((r) => r.mission_id);
    },
  });

  const done = new Set(completed);
  const xp = profile?.xp ?? 0;
  const rank = getRankForXp(xp);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <main className="relative z-10 min-h-screen px-4 py-6 max-w-3xl mx-auto">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] text-neon flicker">// GHOSTLINE_HQ</p>
          <h1 className="font-mono text-2xl text-foreground mt-1">
            {profile?.callsign ?? "operator"}
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            rank <span className="text-neon-magenta">{rank}</span> · xp{" "}
            <span className="text-neon">{xp}</span>
          </p>
        </div>
        <button
          onClick={signOut}
          className="rounded border border-border p-2 text-muted-foreground hover:border-neon hover:text-neon"
          aria-label="sign out"
        ><LogOut className="h-4 w-4" /></button>
      </header>

      <section className="mt-8 space-y-6">
        {ARCS.map((arc) => {
          const arcMissionIds = arc.episodes.flatMap((e) => e.missions.map((m) => m.id));
          const arcDone = arcMissionIds.filter((id) => done.has(id)).length;
          return (
            <div key={arc.id} className="terminal-frame rounded-md p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-mono text-sm text-neon">{arc.title}</h2>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {arcDone}/{arcMissionIds.length}
                </span>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground mt-1">{arc.tagline}</p>

              <ul className="mt-4 grid gap-2">
                {arc.episodes.map((ep, i) => {
                  const m = ep.missions[0];
                  const prevDone = i === 0 ? true : done.has(arc.episodes[i - 1].missions[0].id);
                  const prevArcLastDone =
                    arc.id === 1
                      ? true
                      : done.has(
                          ARCS[arc.id - 2].episodes[ARCS[arc.id - 2].episodes.length - 1].missions[0].id,
                        );
                  const unlocked = prevDone && (i > 0 || prevArcLastDone);
                  const isDone = done.has(m.id);
                  return (
                    <li key={ep.id}>
                      {unlocked ? (
                        <Link
                          to="/mission/$id" params={{ id: m.id }}
                          className="flex items-center gap-3 rounded border border-border bg-card/60 px-3 py-2 hover:border-neon transition group"
                        >
                          <span className="font-mono text-[11px] text-muted-foreground w-10">EP{ep.number}</span>
                          <span className="font-mono text-sm flex-1 truncate">{ep.title}</span>
                          {isDone ? (
                            <Check className="h-4 w-4 text-[var(--success)]" />
                          ) : (
                            <Zap className="h-4 w-4 text-neon-magenta opacity-0 group-hover:opacity-100" />
                          )}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 rounded border border-border/40 bg-card/30 px-3 py-2 opacity-60">
                          <span className="font-mono text-[11px] text-muted-foreground w-10">EP{ep.number}</span>
                          <span className="font-mono text-sm flex-1 truncate text-muted-foreground">— locked —</span>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <footer className="mt-10 text-center font-mono text-[10px] text-muted-foreground">
        // stay in the shadows.
      </footer>
    </main>
  );
}
