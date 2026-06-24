import { Copy, Eye, Bookmark, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Prompt } from "@/lib/prompts";

export function PromptCard({ p }: { p: Prompt }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(p.prompt);
    setCopied(true);
    toast.success("Prompt Copied Successfully");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl glass transition duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_oklch(0.85_0.18_210/0.4)]">
      <div className="relative overflow-hidden">
        <img
          src={p.image}
          alt={p.title}
          width={p.w}
          height={p.h}
          loading="lazy"
          className="w-full transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 transition group-hover:opacity-100" />

        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          aria-label="Save"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass-strong opacity-0 transition group-hover:opacity-100 hover:text-primary"
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-cyan-400 px-3 py-2 text-xs font-semibold text-background transition hover:opacity-90"
          >
            {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy Prompt</>}
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full glass-strong hover:text-primary" aria-label="View">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

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
  );
}
