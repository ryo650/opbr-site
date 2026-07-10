import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "OPBR Guide",
  alternateName: ["OPBR Tier List & Guide", "One Piece Bounty Rush Guide"],
  url: "https://opbr-site.vercel.app",
};

export const metadata: Metadata = {
  verification:{ "google": "3E7MzcTwoRzsGYr3UPygrqEsML__uod9wisR7CDMdes" 
  },

  title: {
    default: "OPBR Tier List & Guide | One Piece Bounty Rush",
    template: "%s | OPBR Tier List & Guide",
  },

  description: 
  "Tier lists, character rankings, and guides for One Piece Bounty Rush.",

  applicationName: "OPBR Tier List & Guide",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}
