import type { MetadataRoute } from "next";
import { scouts } from "@/data/scouts";

const baseUrl = "https://opbr-site.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/tier-list`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/scout-simulator`,
            lastModified: new Date(),
        },
    ];

    const scoutPages: MetadataRoute.Sitemap = scouts.map((scout) => ({
        url: `${baseUrl}/scout-simulator/${scout.id}`,
        lastModified: new Date(),
    }));

    return [...staticPages, ...scoutPages];
}
