"use client"

import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PageGuide } from "@/components/dashboard/page-guide";

export default function PerformancePage() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-black uppercase text-white">Performance Analytics</h1>
            <p className="text-muted-foreground text-sm font-medium">In-depth analysis of your SEO ROI and conversion metrics.</p>
          </div>

          <PageGuide 
            description="Consolidated performance dashboard showing organic growth, goal completion, and user behavior trends."
            steps={[
              "Monitor 'Goal Completion' to track quarterly progress",
              "Review 'User Behavior' to identify traffic quality",
              "Check 'Revenue Impact' (on Dashboard) for total ROI",
              "Analyze returning visitor percentages to gauge brand authority"
            ]}
            tips={[
              "A returning visitor rate above 20% indicates high trust in your local expertise.",
              "Map Pack Dominance often leads to higher conversion rates than standard organic links."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Goal Completion</CardTitle>
                </div>
                <CardDescription>Tracking your quarterly SEO objectives.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Organic Traffic Growth</span>
                    <span className="text-white">75%</span>
                  </div>
                  <Progress value={75} className="h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Top 10 Keyword Count</span>
                    <span className="text-white">42%</span>
                  </div>
                  <Progress value={42} className="h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Map Pack Dominance</span>
                    <span className="text-white">90%</span>
                  </div>
                  <Progress value={90} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm font-black uppercase tracking-widest">User Behavior</CardTitle>
                </div>
                <CardDescription>How organic visitors interact with your site.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-white/5">
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Bounce Rate</p>
                  <p className="text-2xl font-black text-white">34.2%</p>
                  <p className="text-[9px] text-primary mt-1 font-black uppercase tracking-widest">-5% improvement</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-white/5">
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Avg. Session</p>
                  <p className="text-2xl font-black text-white">4m 12s</p>
                  <p className="text-[9px] text-primary mt-1 font-black uppercase tracking-widest">+18s improvement</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-white/5">
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Conversion</p>
                  <p className="text-2xl font-black text-white">3.8%</p>
                  <p className="text-[9px] text-white mt-1 font-black uppercase tracking-widest">-0.2% decrease</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-white/5">
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Returning</p>
                  <p className="text-2xl font-black text-white">22.5%</p>
                  <p className="text-[9px] text-primary mt-1 font-black uppercase tracking-widest">+2% improvement</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
