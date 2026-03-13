
"use client"

import { Ban, Sparkles, SearchX, Cpu, Video, FileText, Share2, LayoutGrid, CalendarDays, Rocket, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Problem Section featuring High-Fidelity Bubble Windows.
 * Weights: AGENT (900) / PRO (400)
 */

const pains = [
  {
    icon: SearchX,
    title: "Blind Spots in Local SEO",
    description: "SEO today applies to maps, videos, images, social media content, and Ai search, not just websites."
  },
  {
    icon: Sparkles,
    title: "AI SEO Tools",
    description: "Our Ai integrated tools save time and money by deploying rapid analysis and edit automation."
  },
  {
    icon: Ban,
    title: "System Exhaustion",
    description: "Say goodbye to multiple platforms and software integration overload."
  }
];

const techSuite = [
  { title: "SEO Automation", icon: Cpu, desc: "Autonomous technical audits and high-fidelity search optimizations." },
  { title: "Video / Photo Editor", icon: Video, desc: "Cinematic property tours and professional HDR pixel enhancements." },
  { title: "Content Generation", icon: FileText, desc: "Semantic neighborhood articles and SEO-optimized listing narratives." },
  { title: "Social Media Integration", icon: Share2, desc: "Seamless content delivery across all your business channels." },
  { title: "Custom Template Library", icon: LayoutGrid, desc: "Private logic blueprints designed for your unique brand voice." },
  { title: "Automation Scheduler", icon: CalendarDays, desc: "High-frequency posting and automated market visibility sync." },
  { title: "Unfair Advantage", icon: Rocket, desc: "Dominate local search results with elite search intelligence." },
  { title: "More Time and Money", icon: Clock, desc: "Reclaim agency hours and maximize your total marketing ROI." },
];

export function ProblemSection() {
  return (
    <section id="why-agentpro" className="pt-11 pb-32 bg-black scroll-mt-20 font-body relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-20 space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Zap className="w-3 h-3 fill-current" /> Intelligence Layer
          </div>
          <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-white uppercase font-brand leading-none">
            Integrated Technology Suite
          </h2>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-4xl mx-auto text-center">
            A highly advanced and user friendly Ai automated SEO/GSE domination system is pretty powerful on its own, but by teaming up with Google, we offer an integrated technology suite for brands beyond comparison and like nothing ever seen before.
          </p>
        </div>
        
        {/* Pains Grid - Bubble Windows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {pains.map((pain, i) => (
            <div 
              key={i} 
              className="glass-card border border-primary/20 bg-primary/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 transition-all duration-500 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.03] shadow-[0_0_40px_rgba(37,99,235,0.1)] group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <pain.icon className="w-10 h-10 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-normal text-white uppercase tracking-tight">{pain.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {pain.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Service Grid - Miniature Bubble Windows */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techSuite.map((item, i) => (
              <div 
                key={i} 
                className="glass-card border border-primary/10 bg-white/[0.02] rounded-[2rem] p-8 flex flex-col items-center text-center space-y-4 transition-all duration-500 hover:bg-primary/5 hover:border-primary/30 hover:scale-[1.05] shadow-[0_0_20px_rgba(37,99,235,0.05)] group"
              >
                <div className="p-3.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-white">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
