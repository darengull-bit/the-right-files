"use client"

import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, Pin, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageGuide } from "@/components/dashboard/page-guide";

export default function MapPackPage() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-black uppercase text-white">Heat Map Control</h1>
            <p className="text-muted-foreground">Monitor and optimize your local search presence with high-frequency heat maps.</p>
          </div>

          <PageGuide 
            description="Dedicated interface for monitoring and dominating the Google Maps '3-Pack' for localized queries using geo-accurate heat maps."
            steps={[
              "Verify your business entity in Google Knowledge Graph",
              "Check for Name, Address, and Phone (NAP) consistency",
              "Review regional visibility scores in the heatmap (Processing)",
              "Identify keywords currently ranking in Map positions #1-3"
            ]}
            tips={[
              "Entity-based authority is 40% of the ranking factor for Map Pack positions.",
              "NAP consistency is verified by LLMs during entity ingestion."
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground">Local Visibility</CardTitle>
                <Pin className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-white">68%</div>
                <p className="text-[10px] text-primary mt-1 font-black uppercase tracking-widest">+4% from last month</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground">Top 3 Positions</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-white">12</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">Keywords in Map Pack</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground">Unclaimed Listings</CardTitle>
                <AlertCircle className="w-4 h-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-white">0</div>
                <p className="text-[10px] text-white mt-1 font-black uppercase tracking-widest">All verified</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-normal uppercase tracking-widest">Regional Heat Map</CardTitle>
              <CardDescription>Visualizing your dominance across geographical regions.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center bg-muted/20 rounded-xl border border-white/5 mx-6 mb-6">
              <div className="text-center space-y-4">
                <Map className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Heat map data is processing. Check back in 24 hours.</p>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-black">STAGING</Badge>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
