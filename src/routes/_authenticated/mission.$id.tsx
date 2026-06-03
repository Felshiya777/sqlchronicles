import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Play, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "sql.js";
import { findMission, ARCS } from "@/game/content";
import { createDb, runQuery, compareResults, previewTables } from "@/lib/sql-engine";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/mission/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Mission ${params.id} // GHOSTLINE` }],
  }),
  component: MissionPage,
});

type TablePreview = { name: string; columns: string[]; rows: unknown[][] };

function MissionPage() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const found = useMemo(() => findMission(id), [id]);

  const [db, setDb] = useState<Database | null>(null);
  const [previews, setPreviews] = useState<TablePreview[]>([]);
  const [expected, setExpected] = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TablePreview | null>(null);
  const [trace, setTrace] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "fail">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when mission id changes
  useEffect(() => {
    setQuery(""); setResult(null); setTrace(0); setStatus("idle"); setErrMsg(null);
  }, [id]);

  // Load DB
  useEffect(() => {
    if (!found) return;
    let alive = true;
    (async () => {
      const fresh = await createDb(found.mission.setupSql);
      if (!alive) return;
      setDb(fresh);
      setPreviews(await previewTables(fresh));
      // Compute expected from a separate db so player's writes don't affect comparison
      const exp = await createDb(found.mission.setupSql);
      const r = runQuery(exp, found.mission.expectedSql);
      exp.close();
      if (r.ok) setExpected({ columns: r.columns, rows: r.rows });
    })();
    return () => { alive = false; if (db) db.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!found) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="terminal-frame rounded p-6 text-center font-mono">
          <p className="text-neon-magenta">// mission not found</p>
          <Link to="/play" className="mt-3 inline-block text-neon underline">return to HQ</Link>
        </div>
      </main>
    );
  }

  const { arc, episode, mission } = found;

  async function execute() {
    if (!db || !expected) return;
    setBusy(true); setErrMsg(null);
    // Player runs query on a FRESH db so they can re-try cleanly each run
    const fresh = await createDb(mission.setupSql);
    const r = runQuery(fresh, query);
    if (!r.ok) {
      setStatus("fail"); setErrMsg(r.error); setResult(null);
      bumpTrace();
      fresh.close(); setBusy(false); return;
    }
    setResult({ name: "result", columns: r.columns, rows: r.rows });
    const match = compareResults({ columns: r.columns, rows: r.rows }, expected, !!mission.orderSensitive);
    if (match) {
      setStatus("success");
      await persistCompletion();
    } else {
      setStatus("fail");
      setErrMsg("Query ran, but result doesn't match the target.");
      bumpTrace();
    }
    fresh.close();
    setBusy(false);
  }

  function bumpTrace() {
    setTrace((t) => {
      const next = Math.min(100, t + 25);
      if (next >= 100) toast.error("// TRACE COMPLETE — NEXACORP locking in. Try again, ghost.");
      return next;
    });
  }

  async function persistCompletion() {
    toast.success(`+${mission.xp} XP // mission complete`);
    // Upsert progress and bump XP server-side via two writes
    const { error: progErr } = await supabase
      .from("mission_progress")
      .upsert({ user_id: user.id, mission_id: mission.id }, { onConflict: "user_id,mission_id" });
    if (progErr) console.error(progErr);
    // Only award XP the first time
    const { data: existing } = await supabase
      .from("mission_progress").select("attempts").eq("user_id", user.id).eq("mission_id", mission.id).maybeSingle();
    if (existing && existing.attempts <= 1) {
      const { data: prof } = await supabase.from("profiles").select("xp").eq("id", user.id).maybeSingle();
      const newXp = (prof?.xp ?? 0) + mission.xp;
      await supabase.from("profiles").update({ xp: newXp }).eq("id", user.id);
    }
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["progress"] });
  }

  const dead = trace >= 100;

  return (
    <main className="relative z-10 min-h-screen px-4 py-5 max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between gap-2">
        <Link to="/play" className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-neon">
          <ArrowLeft className="h-3 w-3" /> HQ
        </Link>
        <div className="font-mono text-[10px] text-muted-foreground">
          {arc.codename} · EP{episode.number}
        </div>
      </div>

      <h1 className="mt-3 font-mono text-xl text-foreground">{episode.title}</h1>
      <p className="mt-1 font-mono text-[11px] text-neon">{mission.title}</p>

      {/* Trace meter */}
      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>// security trace</span>
          <span className={dead ? "text-destructive" : trace > 50 ? "text-[var(--warning)]" : "text-neon"}>
            {trace}%
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded bg-input overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${trace}%`,
              background: dead
                ? "var(--destructive)"
                : trace > 50
                  ? "var(--warning)"
                  : "var(--neon-cyan)",
              boxShadow: trace > 0 ? "0 0 12px currentColor" : undefined,
            }}
          />
        </div>
      </div>

      <section className="mt-5 terminal-frame rounded p-4">
        <p className="font-mono text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{mission.story}</p>
        <div className="mt-3 rounded border border-neon/40 bg-primary/5 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-neon">// objective</p>
          <p className="font-mono text-xs text-foreground mt-1">{mission.objective}</p>
        </div>
        {mission.hint && (
          <details className="mt-3 group">
            <summary className="cursor-pointer font-mono text-[11px] text-neon-magenta">// hint</summary>
            <pre className="mt-2 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">{mission.hint}</pre>
          </details>
        )}
      </section>

      <section className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">// tables in scope</p>
        <div className="mt-2 space-y-3">
          {previews.map((t) => (
            <TableView key={t.name} preview={t} />
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">// terminal</p>
        <textarea
          ref={taRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          rows={5}
          placeholder="-- write your query here"
          className="mt-2 w-full rounded border border-neon/60 bg-[oklch(0.07_0.02_270)] p-3 font-mono text-sm text-neon placeholder:text-muted-foreground focus:outline-none focus:border-neon"
          style={{ caretColor: "var(--neon-cyan)" }}
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={execute}
            disabled={busy || dead || !query.trim()}
            className="inline-flex items-center gap-2 rounded border border-neon bg-primary/10 px-4 py-2 font-mono text-sm text-neon hover:bg-primary/20 disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" /> run
          </button>
          {dead && (
            <button
              onClick={() => { setTrace(0); setStatus("idle"); setErrMsg(null); }}
              className="inline-flex items-center gap-2 rounded border border-destructive px-4 py-2 font-mono text-sm text-destructive hover:bg-destructive/10"
            ><Zap className="h-3.5 w-3.5" /> retry</button>
          )}
        </div>

        {errMsg && (
          <p className="mt-3 font-mono text-xs text-destructive">// {errMsg}</p>
        )}

        {result && (
          <div className="mt-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">// result</p>
            <TableView preview={result} compact />
          </div>
        )}

        {status === "success" && (
          <div className="mt-4 rounded border border-[var(--success)] bg-[var(--success)]/10 p-3">
            <p className="font-mono text-sm text-[var(--success)]">// signal accepted. +{mission.xp} XP</p>
            <div className="mt-3 flex gap-2">
              <Link
                to="/play"
                className="rounded border border-[var(--success)] px-3 py-1.5 font-mono text-xs text-[var(--success)]"
              >back to HQ</Link>
              {nextMissionLink(id) && (
                <Link
                  to="/mission/$id" params={{ id: nextMissionLink(id)! }}
                  className="rounded border border-neon bg-primary/10 px-3 py-1.5 font-mono text-xs text-neon"
                  onClick={() => navigate({ to: "/mission/$id", params: { id: nextMissionLink(id)! } })}
                >next mission →</Link>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function nextMissionLink(currentId: string): string | null {
  const flat = ARCS.flatMap((a) => a.episodes.flatMap((e) => e.missions.map((m) => m.id)));
  const idx = flat.indexOf(currentId);
  return idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
}

function TableView({ preview, compact }: { preview: TablePreview; compact?: boolean }) {
  return (
    <div className="rounded border border-border bg-card/60 overflow-hidden">
      {!compact && (
        <div className="border-b border-border px-3 py-1.5 font-mono text-[11px] text-neon-magenta">
          {preview.name}
        </div>
      )}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full text-left font-mono text-xs">
          <thead className="bg-secondary/40">
            <tr>
              {preview.columns.map((c) => (
                <th key={c} className="px-2.5 py-1.5 text-neon font-normal whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.length === 0 ? (
              <tr><td colSpan={preview.columns.length || 1} className="px-2.5 py-2 text-muted-foreground italic">— empty —</td></tr>
            ) : preview.rows.map((row, i) => (
              <tr key={i} className="border-t border-border/40">
                {row.map((cell, j) => (
                  <td key={j} className="px-2.5 py-1 whitespace-nowrap text-foreground">
                    {cell === null ? <span className="text-muted-foreground">∅</span> : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
