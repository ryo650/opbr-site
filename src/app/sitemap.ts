import type { MetadataRoute } from "next";
import { scouts } from "@/data/scouts";
import { characterGuides } from "@/data/character-guides";

const baseUrl = "https://opbr-site.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/tier-list` },
    { url: `${baseUrl}/character-usage` },
    { url: `${baseUrl}/scout-simulator` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/contact` },
    { url: `${baseUrl}/privacy-policy` },
  ];

  const scoutPages: MetadataRoute.Sitemap = scouts.map((scout) => ({
    url: `${baseUrl}/scout-simulator/${scout.id}`,
  }));

  const characterGuidePages: MetadataRoute.Sitemap =
    Object.values(characterGuides).map((guide) => ({
      url: `${baseUrl}/characters/${guide.characterId}`,
    }));

  return [
    ...staticPages,
    ...scoutPages,
    ...characterGuidePages,
  ];
}
