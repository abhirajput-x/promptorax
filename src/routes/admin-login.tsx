import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "contact.abhayrajput@gmail.com";

export const Route = createFileRoute("/admin-login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Login" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      toast.error("Access denied");
      return;
    }
    setLoading(true);
    try {
      // Try sign in first
      let { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        // First-time setup: create the admin account
        if (error.message.toLowerCase().includes("invalid")) {
          const { error: signUpErr } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: window.location.origin + "/admin-dashboard" },
          });
          if (signUpErr) throw signUpErr;
          const { error: retryErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (retryErr) throw retryErr;
        } else {
          throw error;
        }
      }

      // Verify admin role
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("No session");
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleRow) {
        await supabase.auth.signOut();
        toast.error("Access denied");
        return;
      }
      toast.success("Welcome back, Admin");
      navigate({ to: "/admin-dashboard" });
    } catch (err: any) {
      toast.error(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,oklch(0.85_0.18_210/0.12),transparent_60%)]" />
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl glass-strong p-8 backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Access</h1>
            <p className="text-xs text-muted-foreground">Restricted to authorized administrator</p>
          </div>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Email</span>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 focus-within:border-primary">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-transparent text-sm outline-none"
              autoComplete="email"
            />
          </div>
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Password</span>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 focus-within:border-primary">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm outline-none"
              autoComplete="current-password"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-cyan-400 px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Sign in to Dashboard"}
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          No public registration. Unauthorized access is blocked.
        </p>
      </form>
    </main>
  );
}
