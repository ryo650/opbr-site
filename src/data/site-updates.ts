export type SiteUpdate = {
  id: string;
  /** Site publication date in UTC (YYYY-MM-DD), not a game event date. */
  date: string;
  title: string;
  category: "content" | "guide" | "feature";
  description: string;
  /** Optional Home priority. Lower positive numbers appear first. */
  featuredRank?: number;
  image?: {
    src: `/${string}`;
    alt: string;
    width: number;
    height: number;
    kind: "medal" | "banner";
  };
  links: readonly { href: `/${string}`; label: string }[];
};

export const siteUpdateCategoryLabels: Record<SiteUpdate["category"], string> = {
  content: "Content added",
  guide: "Guide update",
  feature: "Site feature",
};

// Only record additions available on the published site. See docs/site-updates.md.
export const siteUpdates: readonly SiteUpdate[] = [
  {
    id: "halloween-perona-and-uta-medals",
    // 774021265d7f307abdcfd60b1c0c816441b216ee: 2026-10-01T22:36:22Z.
    date: "2026-10-01",
    title: "Halloween Perona and Uta medals added",
    category: "content",
    featuredRank: 1,
    image: {
      src: "/medals/halloween-perona.webp",
      alt: "Pink Halloween Perona medal artwork",
      width: 200,
      height: 200,
      kind: "medal",
    },
    description:
      "Halloween Perona Medal and I'll Trick You Medal are now in the Medal Builder catalog. Search for either medal to explore its traits and build a combination.",
    links: [{ href: "/medal-builder", label: "Explore in Medal Builder" }],
  },
  {
    id: "uta-birthday-scouts-2026",
    // 126e7dbaa81f065f326a50bdd8ad4995dd799b60: 2026-10-01T22:35:14Z.
    date: "2026-10-01",
    title: "Two Uta birthday scouts added",
    category: "content",
    image: {
      src: "/scouts/happy-halloween-uta-20261027.webp",
      alt: "Happy Halloween Uta on the 2026 birthday celebration scout banner",
      width: 1899,
      height: 991,
      kind: "banner",
    },
    description:
      "The Scout Simulator now includes the 2026 Uta's Birthday Celebration and 2026 Almost Uta's Birthday Bounty Festival banners. Open either banner to view its featured characters and try the simulator.",
    links: [
      {
        href: "/scout-simulator/happy-halloween-uta-20261027",
        label: "Uta's Birthday Celebration",
      },
      {
        href: "/scout-simulator/singer-of-the-new-genesis-uta-20261030",
        label: "Almost Uta's Birthday",
      },
    ],
  },
];

export function getSortedSiteUpdates(updates: readonly SiteUpdate[]): SiteUpdate[] {
  const seen = new Set<string>();
  return updates.filter((update) => {
    if (seen.has(update.id)) return false;
    seen.add(update.id);
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export function getHomeSiteUpdates(updates: readonly SiteUpdate[], limit = 3): SiteUpdate[] {
  const sorted = getSortedSiteUpdates(updates);
  const featured = sorted.filter((update) => update.featuredRank !== undefined)
    .sort((a, b) => (a.featuredRank ?? Infinity) - (b.featuredRank ?? Infinity));
  const recent = sorted.filter((update) => update.featuredRank === undefined);
  return [...featured, ...recent].slice(0, Math.max(0, limit));
}
