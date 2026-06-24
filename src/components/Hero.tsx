import { Search, Sparkles, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:pt-24 sm:pb-20">
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] animate-float-glow" />
      <div className="absolute right-0 top-40 -z-10 h-[300px] w-[400px] rounded-full bg-cyan-400/10 blur-[100px]" />

      <div className="mx-auto max-w-4xl text-center animate-fade-up">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          <span>10,000+ curated AI prompts</span>
        </div>

        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Discover{" "}
          <span className="text-gradient-cyan">Viral AI Image</span>
          <br />
          Prompts
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          The largest gallery of trending Midjourney, DALL·E, and Stable Diffusion prompts.
          Copy, remix, and create stunning visuals in seconds.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="relative rounded-full p-[1.5px] bg-gradient-to-r from-primary via-cyan-400 to-primary glow-cyan-lg">
            <div className="relative flex items-center rounded-full bg-background">
              <Search className="ml-5 h-5 w-5 text-primary" />
              <input
                type="search"
                placeholder="Try 'cinematic portrait' or 'cyberpunk city'..."
                className="h-14 w-full bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground sm:text-base"
              />
              <button className="mr-1.5 hidden h-11 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-cyan-400 px-5 text-sm font-semibold text-background transition hover:opacity-90 sm:inline-flex">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href="#grid" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-cyan-400 px-6 py-3 text-sm font-semibold text-background transition hover:scale-105 glow-cyan">
            Explore Prompts <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#trending" className="rounded-full glass px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary">
            View Trending
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
          <div><span className="font-semibold text-foreground">10k+</span> Prompts</div>
          <div><span className="font-semibold text-foreground">500k+</span> Creators</div>
          <div><span className="font-semibold text-foreground">2M+</span> Generations</div>
        </div>
      </div>
    </section>
  );
}
