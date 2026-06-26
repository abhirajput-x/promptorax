import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  LogOut,
  Plus,
  Search,
  Trash2,
  Pencil,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  X,
  FileUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/prompts";
import { BulkImport } from "@/components/admin/BulkImport";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin-dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Dashboard" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminDashboard,
});

type Row = {
  id: string;
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  image_url: string;
  created_at: string;
  signed?: string;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/admin-login" });
        return;
      }
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        navigate({ to: "/" });
        return;
      }
      setReady(true);
      await load();
    })();
  }, [navigate]);

  async function load() {
    const { data, error } = await supabase
      .from("prompts")
      .select("id,title,prompt,category,tags,image_url,created_at")
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    const paths = (data ?? []).map((r) => r.image_url);
    const signed =
      paths.length > 0
        ? (await supabase.storage.from("prompt-images").createSignedUrls(paths, 60 * 60 * 24 * 7)).data
        : [];
    const map = new Map<string, string>();
    signed?.forEach((s) => s.path && s.signedUrl && map.set(s.path, s.signedUrl));
    setRows((data ?? []).map((r) => ({ ...r, signed: map.get(r.image_url) })));
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function confirmDelete() {
    if (!deleteRow || deleting) return;
    setDeleting(true);
    const target = deleteRow;
    try {
      const { data, error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", target.id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Delete blocked by permissions (no rows affected).");
      }
      if (target.image_url && !/^https?:\/\//i.test(target.image_url)) {
        await supabase.storage.from("prompt-images").remove([target.image_url]);
      }
      setRows((prev) => prev.filter((r) => r.id !== target.id));
      toast.success("Prompt deleted successfully.");
      setDeleteRow(null);
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err?.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [rows, search]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        Verifying access…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-display text-base font-bold">Admin · Promptora</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-full glass px-3 py-1.5 text-xs hover:text-primary">
              View Site
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl glass p-4">
            <p className="text-xs text-muted-foreground">Total Prompts</p>
            <p className="mt-1 font-display text-3xl font-bold text-primary">{rows.length}</p>
          </div>
          <div className="rounded-2xl glass p-4">
            <p className="text-xs text-muted-foreground">Categories</p>
            <p className="mt-1 font-display text-3xl font-bold">{new Set(rows.map((r) => r.category)).size}</p>
          </div>
          <div className="rounded-2xl glass p-4">
            <p className="text-xs text-muted-foreground">Storage</p>
            <p className="mt-1 font-display text-3xl font-bold">{rows.length} imgs</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-full glass px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts, categories, tags…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulk(true)}
              className="flex items-center justify-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-semibold hover:text-primary"
            >
              <FileUp className="h-4 w-4" /> Bulk Import
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-cyan-400 px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Prompt
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <article key={r.id} className="overflow-hidden rounded-2xl glass">
              <div className="aspect-[4/3] w-full overflow-hidden bg-background/40">
                {r.signed ? (
                  <img src={r.signed} alt={r.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold">{r.title}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {r.category}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.prompt}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(r);
                      setShowForm(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs hover:text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteRow(r)}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/25"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl glass p-12 text-center text-sm text-muted-foreground">
              No prompts yet. Click "Add Prompt" to upload your first one.
            </div>
          )}
        </div>
      </section>

      {showForm && (
        <PromptForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {showBulk && (
        <BulkImport onClose={() => setShowBulk(false)} onDone={() => load()} />
      )}

      <AlertDialog open={!!deleteRow} onOpenChange={(open) => !open && !deleting && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteRow?.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function PromptForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Row | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial?.image_url) {
      supabase.storage
        .from("prompt-images")
        .createSignedUrl(initial.image_url, 3600)
        .then(({ data }) => data?.signedUrl && setPreview(data.signedUrl));
    }
  }, [initial]);

  function onFile(f: File | null) {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!initial && !file) {
      toast.error("Please choose an image");
      return;
    }
    setSaving(true);
    try {
      let image_url = initial?.image_url ?? "";
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("prompt-images")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        if (initial?.image_url) {
          await supabase.storage.from("prompt-images").remove([initial.image_url]);
        }
        image_url = path;
      }

      const tagArr = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = { title, prompt, category, tags: tagArr, image_url };

      const { data: userData } = await supabase.auth.getUser();
      if (initial) {
        const { error } = await supabase.from("prompts").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast.success("Prompt updated");
      } else {
        const { error } = await supabase
          .from("prompts")
          .insert({ ...payload, created_by: userData.user?.id });
        if (error) throw error;
        toast.success("Prompt added");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-strong p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full glass hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="font-display text-xl font-bold">{initial ? "Edit Prompt" : "Add New Prompt"}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload an AI image and write a copyable prompt. Appears on the homepage instantly.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-[180px_1fr]">
          <div>
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Image</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-square w-full overflow-hidden rounded-2xl border border-dashed border-border/60 bg-background/40 hover:border-primary"
            >
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="mt-1 text-[11px]">Tap to upload</span>
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Tags (comma separated)
              </span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="cyberpunk, neon, portrait"
                className="w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Full Prompt</span>
          <textarea
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl glass px-4 py-3 text-sm font-medium hover:text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-cyan-400 px-4 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : initial ? "Update" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
