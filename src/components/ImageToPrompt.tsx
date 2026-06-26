import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  X,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { generatePromptFromImage } from "@/lib/image-to-prompt.functions";

const PROMPT_TYPES = [
  "General",
  "Midjourney",
  "ChatGPT",
  "Flux",
  "SDXL",
  "Leonardo AI",
  "Ideogram",
] as const;
const DETAIL_LEVELS = ["Basic", "Detailed", "Ultra Detailed"] as const;

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

type PromptType = (typeof PROMPT_TYPES)[number];
type DetailLevel = (typeof DETAIL_LEVELS)[number];

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const MAX_DIM = 1280;
  let { width, height } = bitmap;
  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function ImageToPrompt() {
  const generate = useServerFn(generatePromptFromImage);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [promptType, setPromptType] = useState<PromptType>("General");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("Detailed");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f: File | null | undefined) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      toast.error("Unsupported format. Use JPG, PNG, or WEBP.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File too large. Maximum 10 MB.");
      return;
    }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const runGenerate = async () => {
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const dataUrl = await compressImage(file);
      const out = await generate({
        data: { imageDataUrl: dataUrl, promptType, detailLevel },
      });
      setResult(out.prompt);
      toast.success("Prompt generated!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success("Prompt Copied Successfully");
  };

  const downloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptora-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
            <Wand2 className="h-3 w-3" />
            <span>AI Vision</span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Generate <span className="text-gradient-cyan">Prompt from Image</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Upload any image and instantly get a detailed AI prompt optimized for your favorite model.
          </p>
        </div>

        <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-primary/40 via-cyan-400/20 to-transparent">
          <div className="rounded-2xl glass p-5 sm:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upload */}
              <div>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED.join(",")}
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {!preview ? (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex h-72 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all ${
                      dragging
                        ? "border-primary bg-primary/10 glow-cyan"
                        : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                  >
                    <div className="rounded-full bg-primary/10 p-4">
                      <Upload className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Drop image here or click to upload</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        JPG, PNG, WEBP · Max 10 MB
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="group relative h-72 overflow-hidden rounded-xl border border-border bg-secondary/30">
                    <img
                      src={preview}
                      alt="Upload preview"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={clearAll}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur hover:bg-background"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Prompt Type
                  </label>
                  <Select value={promptType} onValueChange={(v) => setPromptType(v as PromptType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Detail Level
                  </label>
                  <Select
                    value={detailLevel}
                    onValueChange={(v) => setDetailLevel(v as DetailLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DETAIL_LEVELS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={runGenerate}
                  disabled={loading || !file}
                  className="mt-2 h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing image…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Prompt
                    </>
                  )}
                </Button>

                {file && !loading && (
                  <Button
                    variant="ghost"
                    onClick={clearAll}
                    className="h-9 text-muted-foreground"
                  >
                    <X className="mr-1.5 h-4 w-4" /> Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Output */}
            {(loading || result) && (
              <div className="mt-6 animate-fade-up">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  Generated Prompt
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-9/12" />
                      <Skeleton className="h-4 w-10/12" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {result}
                    </p>
                  )}
                </div>

                {result && !loading && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={copyPrompt} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Copy className="mr-1.5 h-4 w-4" /> Copy Prompt
                    </Button>
                    <Button variant="outline" onClick={downloadTxt}>
                      <Download className="mr-1.5 h-4 w-4" /> Download TXT
                    </Button>
                    <Button variant="outline" onClick={runGenerate}>
                      <RefreshCw className="mr-1.5 h-4 w-4" /> Regenerate
                    </Button>
                    <Button variant="ghost" onClick={clearAll}>
                      <X className="mr-1.5 h-4 w-4" /> Clear
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
