import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/**", search: "" },
      {
        pathname: "/characters/black/the-five-elders-st-shepherd-ju-peter.webp",
        search: "?v=3778d4be853d",
      },
      {
        pathname: "/characters/black/the-five-elders-st-topman-warcury.webp",
        search: "?v=96be9b0c9a5d",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/scout-simulator/future-where-i-m-the-most-free-jewelry-bonny",
        destination: "/scout-simulator/future-where-i-m-the-most-free-jewelry-bonney",
        permanent: true,
      },
      {
        source: "/characters/green/future-where-i-m-the-most-free-jewelry-bonny.webp",
        destination: "/characters/green/future-where-i-m-the-most-free-jewelry-bonney.webp",
        permanent: true,
      },
      {
        source: "/scouts/ex/7-5-year-anniversary-future-where-i-m-the-most-free-jewelry-bonny.webp",
        destination: "/scouts/ex/7-5-year-anniversary-future-where-i-m-the-most-free-jewelry-bonney.webp",
        permanent: true,
      },
      {
        source: "/characters/black/the-fouremperors-marshall-d-teach.webp",
        destination: "/characters/black/the-four-emperors-marshall-d-teach.webp",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
