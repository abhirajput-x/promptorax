import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { LogOut, Settings, Share2, Pencil, Loader2 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, signOut, refreshProfile, openLogin } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ prompts: 0, likes: 0, followers: 0, following: 0 });

  useEffect(() => {
    if (!loading && !user) openLogin();
  }, [loading, user, openLogin]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: prompts }, { count: followers }, { count: following }] = await Promise.all([
        supabase.from("prompts").select("*", { count: "exact", head: true }).eq("created_by", user.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("followed_id", user.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
      ]);
      setStats({ prompts: prompts || 0, likes: 0, followers: followers || 0, following: following || 0 });
    })();
  }, [user]);

  const save = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const updates: Record<string, unknown> = {
      display_name: displayName.trim() || null,
      bio: bio.trim(),
    };
    if (!profile.username_changed && username && username !== profile.username) {
      const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (clean.length < 3) { toast.error("Username must be at least 3 characters"); setSaving(false); return; }
      updates.username = clean;
      updates.username_changed = true;
    }
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
    setEditing(false);
    await refreshProfile();
  };

  const share = async () => {
    const url = `${window.location.origin}/profile`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied");
    } catch { toast.error("Could not copy link"); }
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="grid place-items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <div className="rounded-3xl glass p-6 sm:p-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-cyan-400 text-background ring-2 ring-primary/30">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-4xl font-bold">
                  {(profile.display_name || profile.username)[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-2xl font-bold">{profile.display_name || profile.username}</h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.bio && <p className="mt-3 text-sm text-foreground/80">{profile.bio}</p>}

              <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20">
                  <Pencil className="h-3.5 w-3.5" /> Edit Profile
                </button>
                <button onClick={share} className="flex items-center gap-1.5 rounded-full glass px-4 py-2 text-xs font-medium hover:border-primary/40">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <button className="flex items-center gap-1.5 rounded-full glass px-4 py-2 text-xs font-medium hover:border-primary/40">
                  <Settings className="h-3.5 w-3.5" /> Settings
                </button>
                <button onClick={async () => { await signOut(); navigate({ to: "/" }); toast.success("Signed out"); }} className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/20">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Prompts", value: stats.prompts },
              { label: "Followers", value: stats.followers },
              { label: "Following", value: stats.following },
              { label: "Likes", value: stats.likes },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-background/40 p-4 text-center">
                <div className="font-display text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
        </div>

        {editing && (
          <div className="mt-6 rounded-3xl glass p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold">Edit Profile</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Display name</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Username {profile.username_changed && <span className="text-destructive">(can only be changed once — locked)</span>}
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={profile.username_changed}
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-background/40 px-4 text-sm outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-sm font-semibold text-background disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
                </button>
                <button onClick={() => setEditing(false)} className="h-11 rounded-xl glass px-5 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
