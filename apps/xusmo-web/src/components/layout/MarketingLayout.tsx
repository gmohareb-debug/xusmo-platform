import Navbar from "./Navbar";
import Footer from "./Footer";
import InterviewAgent from "@/components/marketing/InterviewAgent";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="pt-[72px]">{children}</main>
      <Footer />
      <InterviewAgent />
    </>
  );
}
