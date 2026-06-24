import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import p9 from "@/assets/p9.jpg";
import p10 from "@/assets/p10.jpg";
import p11 from "@/assets/p11.jpg";
import p12 from "@/assets/p12.jpg";

export type Prompt = {
  id: string;
  image: string;
  title: string;
  category: string;
  prompt: string;
  views: string;
  author: string;
  w: number;
  h: number;
};

export const PROMPTS: Prompt[] = [
  { id: "1", image: p1, title: "Neon Cyber Portrait", category: "Cinematic Portraits", prompt: "Cinematic portrait of a futuristic woman with neon cyan rim lighting, ultra detailed skin, moody dark studio, 85mm lens, shot on Arri Alexa", views: "124k", author: "@nova", w: 1024, h: 1280 },
  { id: "2", image: p2, title: "Ghibli Floating Castle", category: "Ghibli Style", prompt: "Studio Ghibli style floating island with ancient castle, soft painterly clouds at sunset, flying creatures, dreamy atmosphere, Miyazaki aesthetic", views: "89k", author: "@miya", w: 1024, h: 1024 },
  { id: "3", image: p3, title: "Chrome Couture", category: "Fashion Models", prompt: "Editorial high fashion shoot, model in liquid chrome jumpsuit, Vogue magazine cover style, dramatic lighting, glossy metallic textures, beige seamless", views: "201k", author: "@haute", w: 1024, h: 1440 },
  { id: "4", image: p4, title: "Twin Moon Dragon", category: "Fantasy Art", prompt: "Epic fantasy dragon perched on a crystal mountain peak under twin moons, glowing magical runes, digital matte painting, ArtStation trending", views: "312k", author: "@drago", w: 1024, h: 1100 },
  { id: "5", image: p5, title: "Sakura Dream", category: "Anime", prompt: "Anime girl with lavender hair under cherry blossom tree, petals swirling, soft pastel lighting, detailed shoujo manga eyes, official artwork", views: "156k", author: "@yuki", w: 1024, h: 1300 },
  { id: "6", image: p6, title: "Shadow Stalker", category: "Realistic Photos", prompt: "Hyperrealistic close-up of black panther in misty rainforest, piercing amber eyes, wildlife photography, 200mm telephoto, National Geographic", views: "98k", author: "@wild", w: 1024, h: 1024 },
  { id: "7", image: p7, title: "Neo Tokyo Rain", category: "Wallpapers", prompt: "Cyberpunk Tokyo street at night, neon kanji signs in pink and cyan, wet pavement reflections, atmospheric fog, Blade Runner aesthetic, 4k wallpaper", views: "445k", author: "@runr", w: 1024, h: 1500 },
  { id: "8", image: p8, title: "Liquid Chrome", category: "Logos", prompt: "Abstract liquid chrome sculpture floating in zero gravity, holographic reflections, studio product photography, pure black background, 3D render", views: "67k", author: "@form", w: 1024, h: 1100 },
  { id: "9", image: p9, title: "Cosmic Wanderer", category: "Cinematic Portraits", prompt: "Astronaut floating in deep space, swirling red nebula reflected in helmet visor, cinematic sci-fi, Interstellar aesthetic, ultra detailed", views: "278k", author: "@orbt", w: 1024, h: 1280 },
  { id: "10", image: p10, title: "Misty Peaks", category: "Wallpapers", prompt: "Aerial drone shot of mountain valley at sunrise, low fog blanketing pine forest, golden hour light, serene minimalist landscape, 8k wallpaper", views: "189k", author: "@vista", w: 1024, h: 1024 },
  { id: "11", image: p11, title: "Weathered Soul", category: "Realistic Photos", prompt: "Intimate portrait of elderly Tibetan monk, weathered skin with deep wrinkles, kind eyes, saffron robes, soft natural window light, 50mm prime", views: "134k", author: "@soul", w: 1024, h: 1400 },
  { id: "12", image: p12, title: "Circuit Emblem", category: "Logos", prompt: "Minimalist tech logo, glowing cyan circuit lines forming hexagonal emblem, pure black background, futuristic branding mockup, vector style", views: "52k", author: "@brnd", w: 1024, h: 1024 },
];

export const CATEGORIES = [
  "Realistic Photos",
  "Fashion Models",
  "Anime",
  "Ghibli Style",
  "Cinematic Portraits",
  "Logos",
  "YouTube Thumbnails",
  "Fantasy Art",
  "Wallpapers",
];
