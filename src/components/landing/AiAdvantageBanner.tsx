
"use client"

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * @fileOverview AI Advantage Banner.
 * Weights: AGENT (900) / PRO (400)
 */
export function AiAdvantageBanner() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-6 relative z-20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <button className="w-full group">
            <div className="glass-card border border-primary/20 bg-primary/5 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-primary/10 hover:border-primary/40 shadow-[0_0_30px_rgba(37,99,235,0.1)]">
              <div className="flex items-center gap-5 text-left">
                <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 shrink-0">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-normal uppercase tracking-tight text-white font-brand">
                    The Only <span className="text-primary">Google-Native</span> SEO Mastermind
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">
                    Powered by the world's #1 search intelligence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end text-right mr-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Intel Core</span>
                  <span className="text-xs font-bold text-white">Gemini Pro 3.9</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10 group-hover:border-white/30 transition-all">
                  {isOpen ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
                </div>
              </div>
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="glass-card mt-4 border-none bg-white/[0.03] rounded-[2.5rem] p-10 md:p-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Zap className="w-64 h-64 text-primary fill-current" />
            </div>
            
            <div className="max-w-5xl mx-auto relative z-10 space-y-10 text-center flex flex-col items-center">
              <div className="space-y-6 flex flex-col items-center">
                <h4 className="text-2xl md:text-3xl font-normal text-white uppercase tracking-tight text-center">
                  #1 Search Engine Optimization Intelligence
                </h4>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium max-w-3xl mx-auto text-center">
                  Google is the undisputed #1 search engine in the world, handling over 90% of global search traffic. <span className="text-white font-[900]">AGENT</span><span className="text-primary font-[400]">PRO</span> is the only SEO platform built on the core logic of <strong className="text-primary">Gemini</strong>—the world's most advanced AI mastermind developed by Google themselves. 
                </p>
                <p className="text-md text-muted-foreground/80 leading-relaxed font-medium max-w-2xl mx-auto text-center">
                  I don't just "guess" at SEO; I have an intuitive, deep-rooted knowledge of Google's search technology, toolsets, and evolving best practices. While other AIs process text, I process the <strong>intent</strong> and <strong>architecture</strong> of the search engine itself.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-normal uppercase text-sm tracking-tight">Native SGE Mapping</p>
                      <p className="text-xs text-muted-foreground mt-1">Perfectly formatted for Google's new Search Generative Experience.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-normal uppercase text-sm tracking-tight">Deep Technical Insight</p>
                      <p className="text-xs text-muted-foreground mt-1">Intuitive reasoning for PageSpeed, Core Web Vitals, and indexing logic.</p>
                    </div>
                  </li>
                </ul>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-normal uppercase text-sm tracking-tight">Entity Authority Mastery</p>
                      <p className="text-xs text-muted-foreground mt-1">Automated mapping of your brand to the Google Knowledge Graph.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-normal uppercase text-sm tracking-tight">Real-Time Data Sync</p>
                      <p className="text-xs text-muted-foreground mt-1">The fastest path from detection to live optimization deployment.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 inline-block">
                  <p className="text-sm font-black text-primary uppercase tracking-[0.2em] italic">
                    "If you aren't optimizing with the mind of the machine that builds the results, you're already behind."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
