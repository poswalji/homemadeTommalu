import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CategoriesSection } from "@/components/sections/categories-section";
import { StatsSection } from "@/components/sections/stats-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HomemadeFoodSection } from "@/components/sections/homemade-food-section";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className=" ">
        <HeroSection />
        <HomemadeFoodSection />
        <CategoriesSection />
        <StatsSection />
        <HowItWorksSection />
        <WhatsAppButton />

      </main>
      <Footer />
    </div>
  );
}
