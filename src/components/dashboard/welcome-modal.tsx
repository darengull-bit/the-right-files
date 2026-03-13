"use client"

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Rocket, CheckCircle2, Sparkles } from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("agentpro_welcome_seen");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const markAsSeen = () => {
    localStorage.setItem("agentpro_welcome_seen", "true");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) markAsSeen();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-card border-none max-w-2xl p-0 overflow-hidden rounded-[2.5rem] font-body">
        <div className="relative">
          <div className="p-10 lg:p-14 flex flex-col items-center justify-center space-y-8 bg-background/95 backdrop-blur-xl text-center">
            <DialogHeader className="p-0 space-y-4 flex flex-col items-center w-full">
              <div className="flex items-center justify-center gap-2 text-primary font-normal uppercase text-xs tracking-[0.3em]">
                <Zap className="w-4 h-4 fill-current" /> Command Protocol Initialized
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-normal text-white uppercase tracking-tighter leading-none text-center whitespace-nowrap">
                Welcome to <span className="text-primary">Domination HQ</span>
              </DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground font-normal leading-relaxed text-center max-w-lg">
                You are now authorized to use <span className="text-white font-[900]">AGENT</span><span className="text-primary font-[400]">PRO</span> autonomous intelligence systems. We are here to help you achieve a new, enhanced level of success in your marketplace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 flex flex-col items-center w-full">
              <div className="flex items-center justify-center gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-normal text-white/90 uppercase tracking-tight">AI Strategy Network Verified</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-normal text-white/90 uppercase tracking-tight">Direct CMS Sync Active</span>
              </div>
            </div>

            <Button 
              onClick={() => handleOpenChange(false)}
              className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-normal uppercase tracking-widest text-sm rounded-2xl shadow-2xl shadow-primary/30 group"
            >
              Launch My Command Center <Rocket className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-[9px] text-center text-muted-foreground/60 uppercase font-normal tracking-[0.3em] flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" /> Redefining Search Dominance for Your Brand
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
