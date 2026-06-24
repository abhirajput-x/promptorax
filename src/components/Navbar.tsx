import { Search, Sparkles, TrendingUp, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { CATEGORIES } from "@/lib/prompts";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <a href="#" className="flex shrink-0 items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-cyan-400 glow-cyan">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Prompt<span className="text-primary">ora</span>
          </span>
        </a>

        <div className="relative hidden flex-1 max-w-xl md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search 10,000+ AI prompts..."
            className="h-10 w-full rounded-full glass px-11 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:glow-cyan"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-2 md:flex">
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Categories <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl glass-strong p-2 shadow-2xl animate-fade-up">
                {CATEGORIES.map((c) => (
                  <a key={c} href="#" className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
                    {c}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="#trending" className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20">
            <TrendingUp className="h-3.5 w-3.5" /> Trending
          </a>
        </nav>

        <button onClick={() => setMobile(!mobile)} className="ml-auto md:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobile && (
        <div className="border-t border-border p-4 md:hidden">
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" placeholder="Search prompts..." className="h-10 w-full rounded-full glass px-11 text-sm outline-none" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.slice(0, 6).map((c) => (
              <a key={c} href="#" className="rounded-full glass px-3 py-1.5 text-xs text-muted-foreground">{c}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
