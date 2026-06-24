import { Camera, Shirt, Sparkles, Trees, Film, Hexagon, Youtube, Wand2, Image as ImageIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/prompts";

const ICONS = [Camera, Shirt, Sparkles, Trees, Film, Hexagon, Youtube, Wand2, ImageIcon];

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Browse by Category</h2>
        <p className="mt-2 text-sm text-muted-foreground">Find the perfect style for your next creation</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
        {CATEGORIES.map((c, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <a
              key={c}
              href="#"
              className="group relative overflow-hidden rounded-2xl glass p-5 transition hover:border-primary/40 hover:-translate-y-0.5"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/30" />
              <div className="relative flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/10 text-primary transition group-hover:glow-cyan">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold">{c}</h3>
                  <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 900 + 100)} prompts</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
