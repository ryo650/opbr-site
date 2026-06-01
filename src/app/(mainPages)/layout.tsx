import { TopHeader } from "@/components/header/TopHeader";

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        {TopHeader()}
        {children}
    </div>
  );
}
