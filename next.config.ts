import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
