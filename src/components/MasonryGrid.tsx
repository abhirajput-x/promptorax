import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PROMPTS, CATEGORIES } from "@/lib/prompts";
import { fetchDbPrompts } from "@/lib/db-prompts";
import { PromptCard } from "./PromptCard";

export function MasonryGrid() {
  const [active, setActive] = useState<string>("All");
  const { data: dbPrompts = [] } = useQuery({
    queryKey: ["db-prompts"],
    queryFn: fetchDbPrompts,
    staleTime: 30_000,
  });

  const feed = useMemo(() => {
    const all = [...dbPrompts, ...PROMPTS];
    const base = active === "All" ? all : all.filter((p) => p.category === active);
    const pool = base.length ? base : all;
    return Array.from({ length: 2 }).flatMap((_, i) =>
      pool.map((p, j) => ({ ...p, id: `${p.id}-${i}-${j}` })),
    );
  }, [active, dbPrompts]);

  return (
    <section id="grid" className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Fresh Drops</h2>
          <p className="mt-1 text-sm text-muted-foreground">Trending prompts from the community</p>
        </div>
      </div>

      <div className="mb-6 -mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex gap-2 whitespace-nowrap">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                active === c
                  ? "bg-gradient-to-r from-primary to-cyan-400 text-background glow-cyan"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="masonry">
        {feed.map((p) => (
          <PromptCard key={p.id} p={p} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <button className="rounded-full glass px-6 py-3 text-sm font-medium transition hover:border-primary hover:text-primary">
          Load More Prompts
        </button>
      </div>
    </section>
  );
}
