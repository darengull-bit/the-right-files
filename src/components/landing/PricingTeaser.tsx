"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/lib/features";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * @fileOverview Pricing Teaser for Brands.
 * Unified High-Fidelity Bubble Windows. No solid blue.
 */

export function PricingTeaser() {
  const [isYearly, setIsYearly] = useState(false);
  const displayPlans = ['starter', 'pro', 'team'] as const;

  return (
    <section id="pricing" className="py-32 px-6 md:px-20 text-center bg-black scroll-mt-20 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto mb-16 space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Zap className="w-3 h-3 fill-current" /> High ROI Pricing
          </div>
          <h2 className="text-[18px] md:text-[28px] lg:text-[36px] font-normal tracking-tight text-white uppercase font-brand leading-none">
            Results at a fraction of the costs
          </h2>
          <p className="text-xl text-muted-foreground font-medium max-w-3xl">
            Choose The Plan That Fits Your Growth Ambitions. Start With A <span className="text-primary font-bold">Free 5-Day Trial</span> On Any Plan.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 mb-20">
          <div className="flex items-center gap-6 p-2 rounded-2xl bg-white/5 border border-white/10">
            <Label className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all cursor-pointer ${!isYearly ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`} onClick={() => setIsYearly(false)}>Monthly</Label>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <Label className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all cursor-pointer ${isYearly ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`} onClick={() => setIsYearly(true)}>
              Yearly <span className="text-white/60 ml-1">(Save 20%+)</span>
            </Label>
          </div>
          {isYearly && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              <Zap className="w-3 h-3 fill-current" /> Yearly Bonus: Triple AI Task Credits Included
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayPlans.map((key) => {
            const plan = PLANS[key];
            const displayCredits = isYearly ? plan.yearlyAiCredits : plan.aiCredits;

            return (
              <div 
                key={key} 
                className="glass-card border border-primary/20 bg-primary/5 rounded-[2.5rem] p-10 flex flex-col items-center h-full transition-all duration-500 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.03] shadow-[0_0_40px_rgba(37,99,235,0.1)] group"
              >
                <div className="space-y-3 mb-10 text-center w-full">
                  <h3 className="text-xl font-normal uppercase tracking-tight text-white">{key}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-normal tracking-tighter text-white">
                      {isYearly ? plan.yearlyPrice : plan.price}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {isYearly ? '/YR' : '/MO'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 flex-1 mb-10 text-center flex flex-col items-center w-full">
                  <li className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-tight text-white/80">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{key === 'team' ? '3+ User Seats' : `${plan.agents} User Seats`}</span>
                  </li>
                  <li className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-tight text-white/80">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{plan.auditsPerMonth} AI Audits</span>
                  </li>
                  <li className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-tight text-white/80">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{displayCredits.toLocaleString()} AI Credits</span>
                  </li>
                  <li className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-tight text-white/80">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{plan.keywords.toLocaleString()} Keywords</span>
                  </li>
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 shadow-xl transition-all"
                  asChild
                >
                  <Link href="/signup">
                    Sign-Up
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
