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
    kind: "medal" | "banner" | "character";
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
    id: "st-topman-warcury-pre-release-guide",
    date: "2026-10-20",
    title: "St. Topman Warcury pre-release guide added",
    category: "guide",
    featuredRank: 1,
    image: {
      src: "/characters/black/the-five-elders-st-topman-warcury.webp?v=96be9b0c9a5d",
      alt: "St. Topman Warcury character artwork",
      width: 876,
      height: 676,
      kind: "character",
    },
    description:
      "Explore the pre-release Character Guide for St. Topman Warcury, including his Defensive Shield, Defender/Attacker switching, skill and Normal Attack videos, predicted matchups, and practical gameplay tips ahead of his October 21 debut.",
    links: [
      { href: "/characters/the-five-elders-st-topman-warcury", label: "Read Warcury's guide" },
    ],
  },
  {
    id: "five-elders-warcury-peter-ex-scout-20261021",
    date: "2026-10-20",
    title: "Five Elders: Warcury & Peter EX Scout announced",
    category: "content",
    featuredRank: 1,
    image: {
      src: "/scouts/five-elders-warcury-peter-extreme-bounty-festival-20261021.webp",
      alt: "St. Topman Warcury and St. Shepherd Ju Peter Extreme Bounty Festival banner",
      width: 1206,
      height: 529,
      kind: "banner",
    },
    description:
      "A new Extreme Bounty Festival featuring St. Topman Warcury and St. Shepherd Ju Peter is scheduled for October 21 at 14:00 JST. Try the Scout Simulator with 0.1% featured rates each. Other scout rates, costs, and the November 30 end date are provisional.",
    links: [
      {
        href: "/scout-simulator/five-elders-warcury-peter-extreme-bounty-festival-20261021",
        label: "Try the Five Elders Scout",
      },
    ],
  },
  {
    id: "st-shepherd-ju-peter-pre-release-guide",
    date: "2026-10-20",
    title: "St. Shepherd Ju Peter pre-release guide added",
    category: "guide",
    featuredRank: 1,
    image: {
      src: "/characters/black/the-five-elders-st-shepherd-ju-peter.webp?v=3778d4be853d",
      alt: "St. Shepherd Ju Peter character artwork",
      width: 888,
      height: 719,
      kind: "character",
    },
    description:
      "A pre-release Character Guide for St. Shepherd Ju Peter is now available. Explore SP Capture, strengths and weaknesses, predicted matchups, and gameplay tips ahead of his October 21 debut.",
    links: [
      { href: "/characters/the-five-elders-st-shepherd-ju-peter", label: "Read Peter's guide" },
    ],
  },
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
