"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

/**
 * @fileOverview Final CTA section.
 * Premium Glass aesthetic. No solid bright blue.
 */

export function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden bg-black border-t border-white/5">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/10 blur-[150px] rounded-full pointer-events-none opacity-30" />
      
      <div className="container mx-auto px-6 text-center space-y-10 relative z-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Zap className="w-3 h-3 fill-current" /> Final Command
          </div>
          <h2 className="text-[18px] md:text-[28px] lg:text-[36px] font-normal tracking-tight text-white uppercase font-brand leading-none">
            Ready to Command the SERPs?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Join modern market leaders using AgentPro's autonomous intelligence to monitor and optimize their search engine dominance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <Button size="lg" variant="outline" className="h-16 px-12 rounded-[1.5in] text-lg font-black gap-3 w-full sm:w-auto shadow-2xl border border-primary/20 bg-primary/5 text-white hover:bg-primary/10 transition-all uppercase tracking-[0.2em] group" asChild>
            <Link href="/signup">
              Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-16 px-12 rounded-[1.5in] text-lg font-black border-white/10 bg-white/5 text-white hover:bg-white/10 w-full sm:w-auto uppercase tracking-[0.2em] transition-all" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
        
        <div className="space-y-2 pt-4">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">
            No credit card required • Cancel anytime
          </p>
          <p className="text-[9px] text-white/20 font-normal uppercase tracking-widest">
            © 2024 Agent Pro SEO Intelligence Systems
          </p>
        </div>
      </div>
    </section>
  );
}
