import { Sparkles, Twitter, Instagram, Youtube, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/50">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-cyan-400 glow-cyan">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <span className="font-display text-lg font-bold">Prompt<span className="text-primary">Verse</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The universe of AI prompts. Discover, copy, and create stunning AI-generated visuals from the world's most talented creators.
            </p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full glass text-muted-foreground transition hover:text-primary hover:border-primary">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">About</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
              <li><a href="#" className="hover:text-primary">Blog</a></li>
              <li><a href="#" className="hover:text-primary">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary">Cookies</a></li>
              <li><a href="#" className="hover:text-primary">License</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 PromptVerse. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Crafted for AI creators worldwide ✦</p>
        </div>
      </div>
    </footer>
  );
}
