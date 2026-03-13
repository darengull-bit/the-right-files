"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Zap } from "lucide-react";

/**
 * @fileOverview Demo CTA Section.
 * High-Fidelity Bubble Window for the input trigger.
 */

export function DemoCTA() {
  const [url, setUrl] = useState("");

  const handleAnalyze = () => {
    console.log("Analyzing site:", url);
  };

  return (
    <section className="py-32 px-6 md:px-20 bg-black text-center border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-black to-black opacity-50" />
      
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Zap className="w-3 h-3 fill-current" /> Instant Intel
          </div>
          <h2 className="text-[18px] md:text-[28px] lg:text-[36px] font-normal tracking-tight text-white uppercase font-brand leading-none">
            See Your Rankings in 60 Seconds
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Enter your website and instantly analyze your local performance against the top brands in your market.
          </p>
        </div>

        <div className="mt-12 glass-card border border-primary/20 bg-primary/5 rounded-[2.5rem] p-8 md:p-12 max-w-3xl mx-auto shadow-[0_0_50px_rgba(37,99,235,0.1)] transition-all hover:bg-primary/10">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Input
              type="url"
              placeholder="https://yourbusiness.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-16 px-8 rounded-[1.5rem] bg-black/40 border-white/10 focus:ring-primary/50 text-lg text-white font-medium placeholder:text-white/20"
            />
            <Button 
              variant="outline"
              size="lg" 
              onClick={handleAnalyze}
              className="h-16 px-10 rounded-[1.5rem] font-bold text-lg shrink-0 border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 shadow-2xl transition-all uppercase tracking-widest"
            >
              Analyze Now
            </Button>
          </div>
          <p className="mt-6 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">
            AgentPro Engine: Gemini 2.5 Active
          </p>
        </div>
      </div>
    </section>
  );
}
