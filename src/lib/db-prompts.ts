import { supabase } from "@/integrations/supabase/client";
import type { Prompt } from "./prompts";

export type DbPrompt = {
  id: string;
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  image_url: string;
  created_at: string;
};

const SIGN_EXPIRY = 60 * 60 * 24 * 7; // 7 days

export async function fetchDbPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("id,title,prompt,category,tags,image_url,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const paths = data.map((p) => p.image_url);
  const { data: signed } = await supabase.storage
    .from("prompt-images")
    .createSignedUrls(paths, SIGN_EXPIRY);

  const urlMap = new Map<string, string>();
  signed?.forEach((s) => {
    if (s.path && s.signedUrl) urlMap.set(s.path, s.signedUrl);
  });

  return data.map((p) => ({
    id: `db-${p.id}`,
    image: urlMap.get(p.image_url) ?? "",
    title: p.title,
    category: p.category,
    prompt: p.prompt,
    views: "new",
    author: "@admin",
    w: 1024,
    h: 1200,
  }));
}
