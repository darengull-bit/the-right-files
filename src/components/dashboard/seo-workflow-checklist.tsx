"use client"

import { useMemo } from "react";
import { CheckCircle2, Circle, ArrowRight, Sparkles, Zap, Target, BarChart, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  isCompleted: boolean;
  href: string;
}

interface SeoWorkflowChecklistProps {
  data: {
    siteConnected: boolean;
    keywordsAdded: boolean;
    googleConnected: boolean;
    auditsPerformed: boolean;
    templatesCreated: boolean;
    socialConnected: boolean;
    postsScheduled: boolean;
  }
}

export function SeoWorkflowChecklist({ data }: SeoWorkflowChecklistProps) {
  const router = useRouter();

  const steps: WorkflowStep[] = useMemo(() => [
    {
      id: "connect-site",
      label: "Establish Business Connection",
      description: "Link your primary website to begin autonomous monitoring.",
      isCompleted: data.siteConnected,
      href: "/settings"
    },
    {
      id: "auth-google",
      label: "Authorize Search Console",
      description: "Verify your site with Google to sync live performance data.",
      isCompleted: data.googleConnected,
      href: "/settings"
    },
    {
      id: "add-keywords",
      label: "Define Keyword Strategy",
      description: "Add at least 5 target keywords for local SERP tracking.",
      isCompleted: data.keywordsAdded,
      href: "/keywords"
    },
    {
      id: "run-audit",
      label: "Execute Technical Audit",
      description: "Dispatch AI agents to identify high-impact optimization gaps.",
      isCompleted: data.auditsPerformed,
      href: "/seo-analysis"
    },
    {
      id: "custom-blueprint",
      label: "Configure Brand Blueprint",
      description: "Create a custom content framework for your unique niche.",
      isCompleted: data.templatesCreated,
      href: "/templates"
    },
    {
      id: "social-sync",
      label: "Enable Social Connect",
      description: "Link professional profiles for automated content delivery.",
      isCompleted: data.socialConnected,
      href: "/social-accounts"
    },
    {
      id: "schedule-content",
      label: "Launch First Campaign",
      description: "Schedule your first SEO-optimized video or listing post.",
      isCompleted: data.postsScheduled,
      href: "/social-calendar"
    }
  ], [data]);

  const completedCount = steps.filter(s => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  
  const nextStep = steps.find(s => !s.isCompleted) || steps[steps.length - 1];

  return (
    <Card className="glass-card border-none shadow-2xl overflow-hidden font-body">
      <CardHeader className="bg-primary/5 border-b border-white/5 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary fill-current" />
              <CardTitle className="text-lg font-black uppercase tracking-tight">SEO Master Workflow</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
              Execution Roadmap: Phase {completedCount === steps.length ? "Complete" : completedCount + 1}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-white">{progressPercent}%</span>
              <Progress value={progressPercent} className="w-32 h-2 bg-white/5" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-primary">
              {completedCount} of {steps.length} Milestones Verified
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Steps List */}
          <div className="lg:col-span-7 divide-y divide-white/5">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                onClick={() => router.push(step.href)}
                className={cn(
                  "p-4 flex items-start gap-4 cursor-pointer transition-all hover:bg-white/[0.02] group",
                  step.isCompleted ? "opacity-60" : "opacity-100"
                )}
              >
                <div className="mt-1">
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className={cn(
                    "text-xs font-black uppercase tracking-tight transition-colors",
                    step.isCompleted ? "text-muted-foreground line-through" : "text-white group-hover:text-primary"
                  )}>
                    {index + 1}. {step.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-normal leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Advisor Panel */}
          <div className="lg:col-span-5 bg-white/[0.02] border-l border-white/5 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-2 px-3 bg-primary/10 border border-primary/20 rounded-full w-fit">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Next AI Suggestion</span>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-white leading-tight uppercase">
                  {completedCount === steps.length 
                    ? "Dominance Achieved. Maintain Visibility."
                    : `Optimize for ${nextStep.label}`}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                  {completedCount === steps.length 
                    ? "All foundation steps are verified. AgentPro is now monitoring your market for local intent shifts."
                    : `To maximize your search visibility, your next priority is to ${nextStep.description.toLowerCase()}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Impact</p>
                  <p className="text-[10px] font-black text-white">HIGH ROI</p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <BarChart className="w-4 h-4 text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Focus</p>
                  <p className="text-[10px] font-black text-white">STRATEGIC</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => router.push(nextStep.href)}
              variant="trigger"
              className="mt-12 w-full h-16 rounded-2xl font-normal uppercase tracking-[0.15em] gap-3 shadow-xl"
            >
              <div className="relative">
                <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                  <Zap className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
              <span className="text-[11px]">Execute Command</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
