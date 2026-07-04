import CommonHeader from "@/components/header/CommonHeader";

export const metadata = {
  verrification: "3E7MzcTwoRzsGYr3UPygrqEsML__uod9wisR7CDMdes",
}

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
