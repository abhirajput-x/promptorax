import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MasonryGrid } from "@/components/MasonryGrid";
import { CategoriesSection } from "@/components/CategoriesSection";
import { TrendingSection } from "@/components/TrendingSection";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptVerse — Discover Viral AI Image Prompts" },
      { name: "description", content: "The largest gallery of trending Midjourney, DALL·E and Stable Diffusion prompts. Copy, remix and create stunning AI visuals in seconds." },
      { property: "og:title", content: "PromptVerse — Discover Viral AI Image Prompts" },
      { property: "og:description", content: "Browse 10,000+ curated AI image prompts. Copy and create instantly." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <MasonryGrid />
        <CategoriesSection />
        <TrendingSection />
      </main>
      <Footer />
    </div>
  );
}
