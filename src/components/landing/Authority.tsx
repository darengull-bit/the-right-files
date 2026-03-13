"use client"

import { ShieldCheck, Users, FileText, Zap } from "lucide-react";

/**
 * @fileOverview Authority section.
 * Refined with High-Fidelity Bubble Windows.
 */

export function Authority() {
  return (
    <section id="authority" className="py-32 px-6 md:px-20 bg-black border-y border-white/5 scroll-mt-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="flex flex-col items-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Zap className="w-3 h-3 fill-current" /> Scalable Authority
          </div>
          <h2 className="text-[18px] md:text-[28px] lg:text-[36px] font-normal tracking-tight text-white uppercase font-brand leading-none">
            Built for Solo Owners and Teams
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Agent Pro SEO integrates with official Google search data sources and integration tools, scaling from boutique solo brands to global enterprise teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="glass-card border border-primary/20 bg-primary/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 transition-all duration-500 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.03] shadow-[0_0_40px_rgba(37,99,235,0.1)] group">
            <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <ShieldCheck className="w-10 h-10 text-primary group-hover:text-white" />
            </div>
            <span className="text-2xl font-normal text-white uppercase tracking-tight">Enterprise-grade security</span>
          </div>
          
          <div className="glass-card border border-primary/20 bg-primary/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 transition-all duration-500 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.03] shadow-[0_0_40px_rgba(37,99,235,0.1)] group">
            <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Users className="w-10 h-10 text-primary group-hover:text-white" />
            </div>
            <span className="text-2xl font-normal text-white uppercase tracking-tight">Multi-seat visibility tracking</span>
          </div>

          <div className="glass-card border border-primary/20 bg-primary/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 transition-all duration-500 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.03] shadow-[0_0_40px_rgba(37,99,235,0.1)] group">
            <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <FileText className="w-10 h-10 text-primary group-hover:text-white" />
            </div>
            <span className="text-2xl font-normal text-white uppercase tracking-tight">White-label reporting</span>
          </div>
        </div>
      </div>
    </section>
  );
}
