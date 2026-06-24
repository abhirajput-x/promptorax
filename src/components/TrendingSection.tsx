import { Flame, TrendingUp } from "lucide-react";
import { PROMPTS } from "@/lib/prompts";
import { PromptCard } from "./PromptCard";

export function TrendingSection() {
  const trending = [PROMPTS[6], PROMPTS[3], PROMPTS[8], PROMPTS[2]];
  const creators = [
    { name: "Nova Sterling", handle: "@nova", prompts: "248", glow: "from-cyan-400 to-blue-500" },
    { name: "Yuki Tanaka", handle: "@yuki", prompts: "186", glow: "from-pink-400 to-primary" },
    { name: "Drago Volk", handle: "@drago", prompts: "412", glow: "from-primary to-cyan-300" },
  ];

  return (
    <section id="trending" className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Flame className="h-3 w-3" /> Trending Today
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">What's Viral Right Now</h2>
          <p className="mt-1 text-sm text-muted-foreground">The most copied prompts in the last 24 hours</p>
        </div>
        <a href="#" className="hidden text-sm text-primary hover:underline sm:inline">View all →</a>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {trending.map((p) => <PromptCard key={p.id} p={p} />)}
        </div>

        <aside className="rounded-2xl glass p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-semibold">Top Creators</h3>
          </div>
          <div className="space-y-3">
            {creators.map((c) => (
              <div key={c.handle} className="flex items-center gap-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${c.glow} text-background font-bold`}>
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.handle} · {c.prompts} prompts</p>
                </div>
                <button className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/20">
                  Follow
                </button>
              </div>
            ))}
          </div>
          <button className="mt-5 w-full rounded-full glass-strong py-2 text-xs font-medium text-muted-foreground transition hover:text-primary">
            Discover more creators
          </button>
        </aside>
      </div>
    </section>
  );
}
