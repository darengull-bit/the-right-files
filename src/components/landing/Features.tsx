
"use client"

import { BrainCircuit, Globe, Key, Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiAdvantageBanner } from "./AiAdvantageBanner";

/**
 * @fileOverview Features Section featuring Bubble Windows.
 * Weights: AGENT (900) / PRO (400)
 */

const features = [
  {
    icon: Key,
    title: "Local Keyword Ranking Tracking",
    description: "Track daily keyword rankings by city, neighborhood, and niche. Get geo-accurate SEO data designed for businesses."
  },
  {
    icon: Globe,
    title: "Competitor SEO Intelligence",
    description: "Monitor competing businesses. Identify ranking gaps and opportunities before they do, so you can stay at the top."
  },
  {
    icon: BrainCircuit,
    title: "Business SEO Audits",
    description: "Automated technical SEO analysis with actionable recommendations tailored for business websites."
  }
];

export function Features() {
  return (
    <section className="py-32 px-6 md:px-20 bg-black scroll-mt-20 relative overflow-hidden" id="features">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20 space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Zap className="w-3 h-3 fill-current" /> Core Dominance
          </div>
          <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-white uppercase font-brand leading-none">
            The Gemini Ai SEO Advantage
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-medium leading-relaxed text-center">
            Past SEO systems weren't built for the speed of the Ai-driven web. Start dominating with high-frequency monitoring, instant content and change deployment, intuitive logic reasoning, and time saving automation. 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="glass-card border border-primary/20 bg-primary/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 transition-all duration-500 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.03] shadow-[0_0_40px_rgba(37,99,235,0.1)] group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <feature.icon className="w-10 h-10 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-normal text-white uppercase tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <AiAdvantageBanner />
        </div>
      </div>
    </section>
  );
}
