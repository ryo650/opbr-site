export type SiteUpdate = {
  id: string;
  /** Site publication date in UTC (YYYY-MM-DD), not a game event date. */
  date: string;
  title: string;
  category: "content" | "guide" | "feature";
  description: string;
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
