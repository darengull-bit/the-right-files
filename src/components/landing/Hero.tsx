
"use client"

import Image from "next/image";
import { Zap } from "lucide-react";

/**
 * @fileOverview Landing Page Hero
 * Weights: AGENT (900) / PRO (400)
 */

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col pt-[1in] pb-12 overflow-hidden bg-black font-body">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none opacity-50" />

      <div className="container mx-auto px-6 relative z-10 flex-1 flex flex-col items-center text-center">
        <div className="flex flex-col items-center group cursor-default select-none mb-12">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-500" />
            <div className="relative bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center h-20 w-20 md:h-24 md:w-24 shadow-2xl">
              <svg 
                className="w-10 h-10 md:w-12 md:h-12 text-primary fill-current transition-transform duration-500 group-hover:scale-110" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <h1 className="text-[3.4rem] md:text-[7.4rem] italic tracking-tighter uppercase leading-none">
              <span className="text-white font-[900]">AGENT</span><span className="text-primary font-[400]">PRO</span>
            </h1>
            <div className="flex flex-col items-center gap-2 mt-4">
              <span className="text-[10px] md:text-[12px] italic text-white/60 uppercase tracking-[0.5em] font-medium">
                Intelligence Systems
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-primary/10">
                <Zap className="w-3 h-3 fill-current" /> POWERED BY GENKIT AI
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <h2 className="flex flex-col gap-2 text-[18px] sm:text-[24px] md:text-[32px] lg:text-[38px] uppercase leading-none tracking-tight px-4">
            <span className="text-white block font-[400]">The #1 SEO AI Automation System</span>
            <span className="text-primary block italic font-[400]">For Brands to Dominate Online</span>
          </h2>
        </div>

        <div className="mt-16 relative w-full max-w-2xl mx-auto px-4 group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-blue-600/30 rounded-[2.5rem] blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
          <div className="relative rounded-[2.5rem] border border-white/10 bg-black/40 p-3 shadow-2xl overflow-hidden backdrop-blur-sm">
            <Image 
              src="/hero-matrix.jpg"
              alt="AgentPro Command Matrix"
              width={1200}
              height={800}
              className="rounded-[2rem] border border-white/5 mx-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
              priority
            />
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto px-6">
          <p className="text-lg md:text-2xl italic font-normal text-primary uppercase tracking-[0.15em] leading-relaxed">
            "If you aren't optimizing with the mind of the machine that builds the results, you're already behind."
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-medium">Platform Intel Core</span>
          <div className="relative group cursor-default">
            <div className="absolute -inset-1 bg-primary/20 blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative flex flex-col items-center p-5 px-12 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-500 hover:border-primary/30 hover:bg-white/[0.05]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.5em] leading-none opacity-80">System Authority</span>
              </div>
              <span className="text-3xl font-[900] text-white tracking-tighter italic uppercase">
                Gemini <span className="text-primary font-[400]">Pro 3.9</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-12 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 mt-20 mb-8 font-black">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary fill-current" /> Enterprise Security
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary fill-current" /> Real-time Data
          </div>
        </div>
      </div>
    </section>
  );
}
