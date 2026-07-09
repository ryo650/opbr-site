import CommonHeader from "@/components/header/CommonHeader";
import type { Metadata } from "next";

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
    icon: "/favicon-2.png",
    shortcut: "/favicon-2.png",
    apple: "/favicon-2.png",
  },
};

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="page">
        <CommonHeader />
        {children}
    </div>
  );
}
