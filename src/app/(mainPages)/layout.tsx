import CommonFooter from "@/components/footer/CommonFooter";
import CommonHeader from "@/components/header/CommonHeader";

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="page">
        <CommonHeader />
        {children}
        <CommonFooter />
    </div>
  );
}
