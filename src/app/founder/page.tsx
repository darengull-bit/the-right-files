"use client"

import { Navbar } from "@/components/landing/Navbar"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Zap, Sparkles, Award } from "lucide-react"
import Image from "next/image"

/**
 * @fileOverview Founder Page - Official Master Build
 * Weights: AGENT (900) / PRO (400)
 */

export default function FounderPage() {
  return (
    <main className="bg-black text-white selection:bg-primary selection:text-primary-foreground min-h-screen font-body">
      <Navbar />
      
      <section className="relative pt-[1.5in] pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                <Zap className="w-3 h-3 fill-current" /> Founder & Lead Architect
              </div>
              
              <h1 className="text-4xl md:text-6xl font-normal uppercase tracking-tighter leading-none">
                Stop Optimizing for Humans. <br/>
                <span className="text-primary italic">Start Dominating the Machine.</span>
              </h1>
              
              <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 relative overflow-hidden group shadow-[0_0_30px_rgba(37,99,235,0.05)]">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm italic font-normal tracking-wide leading-relaxed text-center">
                  "If you aren't optimizing with the mind of the machine that builds the results, you're already behind in the global marketplace."
                </p>
              </div>

              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                "I built <span className="text-white font-[900]">AGENT</span><span className="text-primary font-[400]">PRO</span> because the traditional search marketing playbook is broken. In an era of AI Overviews and Generative Intelligence, having a 'good website' is no longer enough. You need to be a verified entity that the machine trusts."
              </p>
            </div>

            <div className="relative group flex flex-col items-center">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative aspect-[4/5] w-full max-w-md rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-muted/20">
                <Image 
                  src="/founder.jpg" 
                  alt="Daren Gull - Founder Portrait" 
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-1">Authenticated</p>
                  <p className="text-2xl font-normal uppercase tracking-tight text-white">Daren Gull</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Lead Architect & Visionary</p>
                </div>
              </div>
              <div className="mt-6 text-center space-y-1">
                <p className="text-lg font-normal uppercase tracking-tighter text-white">Daren Gull</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Lead Systems Architect</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">The Visionary Biography</h2>
              <h3 className="text-3xl md:text-5xl font-normal uppercase tracking-tight text-white">Architect of Dominance</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-lg text-muted-foreground leading-relaxed font-medium text-center">
              <div className="space-y-6">
                <p>
                  My journey into search intelligence began with a single observation: the most successful businesses weren't necessarily the best at marketing—they were the best at being <span className="text-white">visible</span> to the systems that matter.
                </p>
                <p>
                  I spent years dissecting search algorithms and observing the shift from simple keyword matching to complex entity recognition. I realized that the future of business growth wouldn't be won by human intuition alone, but by <span className="text-white">algorithmic precision</span>.
                </p>
              </div>
              <div className="space-y-6">
                <p>
                  <span className="text-white font-[900]">AGENT</span><span className="text-primary font-[400]">PRO</span> is the culmination of that obsession. I designed this platform to serve as a high-fidelity intelligence layer for businesses across all sectors that are ready to move beyond traditional SEO. 
                </p>
                <p>
                  Our goal is simple: to give your brand an unfair advantage by speaking the language of search models for you.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-white">System Architect</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Visionary Lead</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
