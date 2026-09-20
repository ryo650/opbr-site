import type { MetadataRoute } from "next";
import { scouts } from "@/data/scouts";
import { characterGuides } from "@/data/character-guides";
import { recommendedMedalSets } from "@/data/medal-sets";
import { SITE_URL } from "@/lib/site";

const baseUrl = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/tier-list` },
    { url: `${baseUrl}/character-usage` },
    { url: `${baseUrl}/new-characters` },
    { url: `${baseUrl}/create-tier-list` },
    { url: `${baseUrl}/scout-simulator` },
    { url: `${baseUrl}/medal-builder` },
    { url: `${baseUrl}/medal-sets` },
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

  const medalSetPages: MetadataRoute.Sitemap = recommendedMedalSets.map((set) => ({
    url: `${baseUrl}/medal-sets/${set.id}`,
  }));

  return [
    ...staticPages,
    ...scoutPages,
    ...characterGuidePages,
    ...medalSetPages,
  ];
}
