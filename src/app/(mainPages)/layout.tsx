import CommonFooter from "@/components/footer/CommonFooter";
import CommonHeader from "@/components/header/CommonHeader";

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="page">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <CommonHeader />
        {children}
        <CommonFooter />
    </div>
  );
}
