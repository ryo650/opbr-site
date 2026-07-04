import CommonHeader from "@/components/header/CommonHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  verification:{ "google": "3E7MzcTwoRzsGYr3UPygrqEsML__uod9wisR7CDMdes" },
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
