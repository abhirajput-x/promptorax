import { Copy, Bookmark, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Prompt } from "@/lib/prompts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


function CopyButton({ prompt, size = "sm" }: { prompt: string; size?: "sm" | "lg" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt Copied Successfully");
    setTimeout(() => setCopied(false), 1800);
  };

  const className =
    size === "lg"
      ? "flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-cyan-400 px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
      : "flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-cyan-400 px-3 py-2 text-xs font-semibold text-background transition hover:opacity-90";

  return (
    <button onClick={handleCopy} className={className}>
      {copied ? (
        <>
          <Check className="h-4 w-4" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" /> Copy Prompt
        </>
      )}
    </button>
  );
}

export function PromptCard({ p }: { p: Prompt }) {
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <article className="group relative overflow-hidden rounded-2xl glass transition duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_oklch(0.85_0.18_210/0.4)]">
        <DialogTrigger asChild>
          <div className="relative cursor-pointer overflow-hidden">
            <img
              src={p.image}
              alt={p.title}
              width={p.w}
              height={p.h}
              loading="lazy"
              onError={(e) => {
                const t = e.currentTarget;
                const fb = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80";
                if (t.src !== fb) t.src = fb;
              }}
              className="w-full transition duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 transition group-hover:opacity-100" />

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSaved(!saved); }}
              aria-label="Save"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass-strong opacity-0 transition group-hover:opacity-100 hover:text-primary"
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
            </button>

          </div>
        </DialogTrigger>

        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">{p.title}</h3>
            <span className="shrink-0 text-[10px] text-muted-foreground">{p.views}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{p.category}</span>
            <span className="text-[10px] text-muted-foreground">{p.author}</span>
          </div>
        </div>
      </article>

      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-border/40 bg-secondary/95 p-0 backdrop-blur-xl">
        <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          <div className="relative">
            <img
              src={p.image}
              alt={p.title}
              className="h-full max-h-[70vh] w-full object-contain md:max-h-none"
            />
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <DialogHeader className="text-left">
              <span className="mb-2 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {p.category}
              </span>
              <DialogTitle className="font-display text-2xl font-bold leading-tight">
                {p.title}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-6 flex-1">
              <p className="text-sm font-semibold text-muted-foreground">Prompt</p>
              <p className="mt-2 max-h-[300px] overflow-y-auto rounded-xl bg-background/60 p-4 text-sm leading-relaxed text-foreground">
                {p.prompt}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border/40 pt-6">
              <div className="text-xs text-muted-foreground">
                <span className="block">By {p.author}</span>
                <span>{p.views} views</span>
              </div>
              <CopyButton prompt={p.prompt} size="lg" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
