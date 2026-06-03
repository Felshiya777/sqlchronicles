import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Jack in // GHOSTLINE" }, { name: "description", content: "Sign in to the rebel network." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [callsign, setCallsign] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && user) navigate({ to: "/play", replace: true }); }, [loading, user, navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { callsign: callsign || `ghost_${Math.random().toString(36).slice(2, 7)}` },
          },
        });
        if (error) throw error;
        toast.success("Operator registered. Channel open.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
    } finally { setBusy(false); }
  }

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center px-5 py-10 bg-grid">
      <div className="w-full max-w-sm terminal-frame rounded-md p-6">
        <p className="font-mono text-[11px] text-neon flicker">// SECURE_CHANNEL // ghostline-auth-v3</p>
        <h1 className="mt-2 text-2xl font-mono text-foreground">
          {isSignup ? "+ new operator" : "▸ jack in"}
        </h1>

        <form onSubmit={handleEmail} className="mt-6 space-y-3">
          {isSignup && (
            <input
              value={callsign} onChange={(e) => setCallsign(e.target.value)}
              placeholder="callsign (optional)"
              className="w-full rounded border border-border bg-input/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none"
            />
          )}
          <input
            value={email} onChange={(e) => setEmail(e.target.value)}
            type="email" required placeholder="email"
            className="w-full rounded border border-border bg-input/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none"
          />
          <input
            value={password} onChange={(e) => setPassword(e.target.value)}
            type="password" required minLength={6} placeholder="passkey"
            className="w-full rounded border border-border bg-input/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none"
          />
          <button
            disabled={busy} type="submit"
            className="w-full rounded border border-neon bg-primary/10 px-3 py-2 font-mono text-sm text-neon hover:bg-primary/20 transition disabled:opacity-50"
          >{busy ? "..." : isSignup ? "register" : "authenticate"}</button>
        </form>

        <div className="my-4 flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={handleGoogle} disabled={busy}
          className="w-full rounded border border-border bg-card/60 px-3 py-2 font-mono text-sm hover:border-neon hover:text-neon transition disabled:opacity-50"
        >continue with google</button>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="mt-4 w-full text-center font-mono text-[11px] text-muted-foreground hover:text-neon"
        >
          {isSignup ? "// already an operator? jack in" : "// no record? register"}
        </button>
      </div>
    </main>
  );
}
