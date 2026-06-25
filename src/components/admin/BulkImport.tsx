import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/prompts";

type RawRow = Record<string, unknown>;

type ParsedRow = {
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  image_url: string;
  slug: string;
};

type RowStatus = {
  row: ParsedRow;
  status: "pending" | "uploading" | "ok" | "error";
  message?: string;
};

const MAX_DIM = 1600;
const JPEG_QUALITY = 0.82;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function pick(r: RawRow, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k] ?? r[k.toLowerCase()] ?? r[k.toUpperCase()];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return "";
}

function parseTags(r: RawRow): string[] {
  const raw = r.tags ?? r.Tags ?? r.TAGS;
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === "string")
    return raw
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

function normalizeCategory(c: string): string {
  if (!c) return CATEGORIES[0];
  const m = CATEGORIES.find((x) => x.toLowerCase() === c.toLowerCase());
  return m ?? c.trim();
}

function normalize(r: RawRow): ParsedRow | null {
  const title = pick(r, "title", "name");
  const prompt = pick(r, "prompt", "description", "text");
  if (!title || !prompt) return null;
  const category = normalizeCategory(pick(r, "category"));
  const image_url = pick(r, "image_url", "image", "imageUrl", "url");
  return {
    title,
    prompt,
    category,
    tags: parseTags(r),
    image_url,
    slug: slugify(title),
  };
}

// minimal CSV parser supporting quoted fields and commas inside quotes
function parseCSV(text: string): RawRow[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQ = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") {
        cur.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (field !== "" || cur.length) {
          cur.push(field);
          rows.push(cur);
          cur = [];
          field = "";
        }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else field += c;
    }
  }
  if (field !== "" || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o: RawRow = {};
    headers.forEach((h, i) => (o[h] = r[i] ?? ""));
    return o;
  });
}

async function compressImage(blob: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(blob).catch(() => null);
  if (!bmp) return blob;
  const scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;
  ctx.drawImage(bmp, 0, 0, w, h);
  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b ?? blob), "image/jpeg", JPEG_QUALITY);
  });
}

async function uploadImage(url: string, slug: string): Promise<string> {
  // returns either a storage path (preferred) or the original URL on failure
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.blob();
    if (!raw.type.startsWith("image/")) throw new Error("not an image");
    const compressed = await compressImage(raw);
    const path = `bulk/${slug}-${crypto.randomUUID().slice(0, 8)}.jpg`;
    const { error } = await supabase.storage
      .from("prompt-images")
      .upload(path, compressed, { contentType: "image/jpeg", upsert: false });
    if (error) throw error;
    return path;
  } catch {
    return url; // fallback: DB layer accepts http(s):// URLs directly
  }
}

const SAMPLE_JSON = `[
  {
    "title": "Neon Cyber Portrait",
    "prompt": "Cinematic portrait with neon cyan rim lighting...",
    "category": "Cinematic Portraits",
    "tags": ["cyberpunk", "neon"],
    "image_url": "https://images.unsplash.com/photo-..."
  }
]`;

const SAMPLE_CSV = `title,prompt,category,tags,image_url
"Neon Cyber Portrait","Cinematic portrait with neon...","Cinematic Portraits","cyberpunk,neon","https://images.unsplash.com/photo-..."`;

export function BulkImport({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<RowStatus[]>([]);
  const [batchLimit, setBatchLimit] = useState<10 | 50 | 100>(10);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState({ ok: 0, fail: 0, total: 0 });

  async function onFile(f: File | null) {
    if (!f) return;
    setDone(false);
    setProgress({ ok: 0, fail: 0, total: 0 });
    try {
      const text = await f.text();
      let raw: RawRow[] = [];
      if (f.name.toLowerCase().endsWith(".json") || text.trim().startsWith("[")) {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects");
        raw = parsed as RawRow[];
      } else {
        raw = parseCSV(text);
      }
      const normalized = raw
        .map(normalize)
        .filter((r): r is ParsedRow => r !== null)
        .slice(0, batchLimit);
      if (normalized.length === 0) {
        toast.error("No valid rows. Each row needs a title and prompt.");
        return;
      }
      setRows(normalized.map((row) => ({ row, status: "pending" })));
      toast.success(`Parsed ${normalized.length} rows. Ready to publish.`);
    } catch (e: any) {
      toast.error(`Parse failed: ${e?.message ?? "invalid file"}`);
    }
  }

  async function publishAll() {
    if (rows.length === 0) return;
    setBusy(true);
    setDone(false);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    let ok = 0;
    let fail = 0;
    const next = [...rows];

    for (let i = 0; i < next.length; i++) {
      next[i] = { ...next[i], status: "uploading" };
      setRows([...next]);
      try {
        const r = next[i].row;
        let image_url = r.image_url;
        if (image_url) {
          image_url = await uploadImage(image_url, r.slug);
        } else {
          image_url =
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80";
        }
        const { error } = await supabase.from("prompts").insert({
          title: r.title,
          prompt: r.prompt,
          category: r.category,
          tags: r.tags,
          image_url,
          created_by: userId,
        });
        if (error) throw error;
        next[i] = { ...next[i], status: "ok", message: "Published" };
        ok++;
      } catch (e: any) {
        next[i] = { ...next[i], status: "error", message: e?.message ?? "Failed" };
        fail++;
      }
      setProgress({ ok, fail, total: next.length });
      setRows([...next]);
    }
    setBusy(false);
    setDone(true);
    toast.success(`Published ${ok} prompts${fail ? `, ${fail} failed` : ""}.`);
    if (ok > 0) onDone();
  }

  function reset() {
    setRows([]);
    setDone(false);
    setProgress({ ok: 0, fail: 0, total: 0 });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-strong p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full glass hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="font-display text-xl font-bold">Bulk Prompt Import</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload a CSV or JSON file. Images are auto-compressed and uploaded; slugs and categories are auto-assigned.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Batch size:</span>
          {([10, 50, 100] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setBatchLimit(n)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                batchLimit === n
                  ? "bg-gradient-to-r from-primary to-cyan-400 text-background"
                  : "glass hover:text-primary"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-background/40 px-4 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Upload className="h-5 w-5" />
            <span>Choose CSV or JSON</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json,application/json,text/csv"
            hidden
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={publishAll}
            disabled={busy || rows.length === 0}
            className="rounded-2xl bg-gradient-to-r from-primary to-cyan-400 px-5 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Publishing…
              </span>
            ) : (
              `Publish ${rows.length || ""} prompts`
            )}
          </button>
        </div>

        {progress.total > 0 && (
          <div className="mt-4 rounded-xl bg-background/60 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {progress.ok + progress.fail} / {progress.total}
              </span>
              <span>
                <span className="text-primary">{progress.ok} ok</span>
                {progress.fail > 0 && (
                  <span className="ml-2 text-destructive">{progress.fail} failed</span>
                )}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all"
                style={{
                  width: `${((progress.ok + progress.fail) / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {rows.length > 0 ? (
          <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-border/40">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-secondary/95 text-left text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Slug</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="max-w-[200px] truncate px-3 py-2">{r.row.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.row.category}</td>
                    <td className="max-w-[180px] truncate px-3 py-2 text-muted-foreground">
                      {r.row.slug}
                    </td>
                    <td className="px-3 py-2">
                      {r.status === "ok" && (
                        <span className="flex items-center gap-1 text-primary">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Published
                        </span>
                      )}
                      {r.status === "error" && (
                        <span
                          className="flex items-center gap-1 text-destructive"
                          title={r.message}
                        >
                          <AlertCircle className="h-3.5 w-3.5" /> Failed
                        </span>
                      )}
                      {r.status === "uploading" && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading
                        </span>
                      )}
                      {r.status === "pending" && (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-background/40 p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <FileText className="h-4 w-4" /> Expected fields
            </div>
            <p className="mt-2">
              <b className="text-foreground">title</b>, <b className="text-foreground">prompt</b>{" "}
              (required), optional: <b className="text-foreground">category</b>,{" "}
              <b className="text-foreground">tags</b> (comma-separated or array),{" "}
              <b className="text-foreground">image_url</b>.
            </p>
            <details className="mt-3">
              <summary className="cursor-pointer text-foreground">Sample JSON</summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-background/80 p-3">
                {SAMPLE_JSON}
              </pre>
            </details>
            <details className="mt-2">
              <summary className="cursor-pointer text-foreground">Sample CSV</summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-background/80 p-3">
                {SAMPLE_CSV}
              </pre>
            </details>
          </div>
        )}

        {done && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-full glass px-4 py-2 text-xs hover:text-primary"
            >
              Import another file
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-primary/10 px-4 py-2 text-xs text-primary hover:bg-primary/20"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
