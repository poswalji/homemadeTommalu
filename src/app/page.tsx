import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FeaturesSection } from "@/components/sections/features-section";
import { CategoriesSection } from "@/components/sections/categories-section";
import { StatsSection } from "@/components/sections/stats-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { HeroSection } from "@/components/sections/hero-section";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 ">
        <HeroSection/>
        <FeaturesSection />
        <CategoriesSection />
        <StatsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
