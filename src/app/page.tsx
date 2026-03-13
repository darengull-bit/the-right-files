import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { Features } from "@/components/landing/Features";
import { DemoCTA } from "@/components/landing/DemoCTA";
import { Authority } from "@/components/landing/Authority";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Estate SEO Software | Agent Pro SEO",
  description:
    "AI-powered real estate SEO software for agents and teams. Track keyword rankings, dominate local search results, and generate listing-ready leads.",
  keywords: [
    "real estate SEO",
    "SEO for realtors",
    "real estate keyword tracking",
    "real estate ranking software",
    "local SEO for agents",
    "business SEO software"
  ]
};

export default function HomePage() {
  return (
    <main className="bg-black text-white selection:bg-primary selection:text-primary-foreground min-h-screen">
      <Navbar />
      <Hero />
      <ProblemSection />
      <Features />
      <DemoCTA />
      <Authority />
      <PricingTeaser />
      <FinalCTA />
    </main>
  );
}
