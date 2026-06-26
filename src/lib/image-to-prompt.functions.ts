import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z
    .string()
    .min(20)
    .refine((v) => /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(v), {
      message: "Unsupported image format. Use JPG, PNG, or WEBP.",
    })
    .refine((v) => v.length < 15_000_000, { message: "Image too large." }),
  promptType: z.enum([
    "General",
    "Midjourney",
    "ChatGPT",
    "Flux",
    "SDXL",
    "Leonardo AI",
    "Ideogram",
  ]),
  detailLevel: z.enum(["Basic", "Detailed", "Ultra Detailed"]),
});

function buildSystemPrompt(promptType: string, detailLevel: string) {
  const depthMap: Record<string, string> = {
    Basic: "Concise 1-2 sentence prompt capturing the core subject and style.",
    Detailed:
      "A rich paragraph (80-140 words) covering subject, composition, lighting, colors, mood, style, and environment.",
    "Ultra Detailed":
      "A highly detailed prompt (180-280 words) describing subject, composition, camera angle, lighting, colors, background, style, mood, clothing, facial expression, pose, environment, materials, textures, lens, depth of field, and cinematic details.",
  };

  const styleMap: Record<string, string> = {
    General: "Output a clean, model-agnostic descriptive prompt in natural language.",
    Midjourney:
      "Optimize for Midjourney v6+. Use comma-separated descriptive phrases. End with parameters like --ar (matching the image orientation), --style raw, --v 6.1.",
    ChatGPT:
      "Optimize for ChatGPT/DALL·E 3. Use natural, flowing sentences describing the scene vividly.",
    Flux: "Optimize for Flux. Use natural-language sentences with strong photographic and stylistic detail; no weight syntax.",
    SDXL: "Optimize for SDXL. Use comma-separated tags and modifiers (subject, style, lighting, lens, quality boosters). Include a short negative prompt line prefixed with 'Negative prompt:'.",
    "Leonardo AI":
      "Optimize for Leonardo AI. Comma-separated descriptive tags with style and quality modifiers.",
    Ideogram:
      "Optimize for Ideogram. Natural-language prompt; if text appears in the image, transcribe it in quotes.",
  };

  return `You are an expert AI image prompt engineer. Analyze the provided image and produce a single prompt that another AI could use to recreate it.

Target model: ${promptType}
${styleMap[promptType]}

Detail level: ${detailLevel}
${depthMap[detailLevel]}

Rules:
- Output ONLY the prompt text. No preamble, no explanations, no markdown headings, no surrounding quotes.
- Do not mention that an image was provided.
- Do not invent text/logos that aren't visible.`;
}

export const generatePromptFromImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service is not configured.");

    const system = buildSystemPrompt(data.promptType, data.detailLevel);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Generate the ${data.detailLevel.toLowerCase()} ${data.promptType} prompt now.`,
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const prompt = json.choices?.[0]?.message?.content?.trim();
    if (!prompt) throw new Error("AI returned an empty response.");

    return { prompt };
  });
