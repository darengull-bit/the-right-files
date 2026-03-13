"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Loader2, 
  Zap, 
  ArrowRight,
  Globe,
  BarChart3,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { executeSeoAuditAction } from "@/app/actions/audit";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { PageGuide } from "@/components/dashboard/page-guide";

export default function SeoAnalysisPage() {
  const { user, organization, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const organizationId = organization?.id;

  const auditsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "seo_audits"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
  }, [db, organizationId]);

  const { data: recentAudits, isLoading: auditsLoading } = useCollection(auditsQuery);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !organizationId || !user?.uid) return;

    setIsAnalyzing(true);
    try {
      const result = await executeSeoAuditAction(organizationId, user.uid, {
        keywords: [{ keyword: url, position: 0, volume: 0 }],
        metrics: { dominance: 0, mapPack: 0, revenue: 0 },
        pageContext: `On-demand audit for ${url}`
      });

      if (result.success) {
        toast({ 
          title: "Analysis Enqueued", 
          description: "Our AI agents are analyzing the page. Results will appear in your history shortly." 
        });
        setUrl("");
      } else {
        toast({ variant: "destructive", title: "Analysis Failed", description: result.error });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "System Error", description: "Could not connect to analysis service." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-body">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-black uppercase text-white">Technical SEO Analysis</h1>
            <p className="text-muted-foreground text-sm font-normal">Deep-crawl audit to identify technical gaps and AI-driven growth opportunities.</p>
          </div>

          <PageGuide 
            description="Deep technical scanner that evaluates your webpage against 40+ SEO checkpoints including heading hierarchy and CTR-optimized metadata."
            steps={[
              "Enter the full URL of the page you want to audit",
              "Click 'Execute Scan' to dispatch AI agents",
              "Wait 15-30 seconds for the engine to crawl and analyze",
              "Review the Health Score and actionable technical findings"
            ]}
            tips={[
              "Run analysis on competitor URLs to find semantic gaps in their local strategy.",
              "Ensure your H1 tags precisely match the primary city intent."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass-card border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 py-6">
                  <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
                    <Zap className="w-4 h-4 fill-current text-primary" /> New Command Audit
                  </CardTitle>
                  <CardDescription className="text-[11px] uppercase font-bold tracking-widest opacity-60">Enter website URL</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <form onSubmit={handleRunAnalysis} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="url" className="sr-only">Website URL</Label>
                        <Input 
                          id="url"
                          type="url" 
                          placeholder="https://yourbusiness.com" 
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="bg-white/5 border-none h-14 rounded-2xl text-lg focus:ring-primary/50 font-normal"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isAnalyzing} 
                        variant="trigger"
                        className="h-14 px-8 rounded-2xl font-normal uppercase tracking-[0.15em] gap-3 shadow-xl"
                      >
                        <div className="relative">
                          <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Search className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        <span className="text-[11px]">Execute Scan</span>
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic font-normal uppercase tracking-widest">
                      Analyzer Engine: Gemini 2.5 Flash • Runtime: 15-30s.
                    </p>
                  </form>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5">
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Recent Analysis History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {auditsLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                  ) : recentAudits && recentAudits.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {recentAudits.map((audit) => (
                        <div key={audit.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                              <Globe className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-black text-white uppercase truncate max-w-[300px]">{audit.url}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-primary/20 text-white bg-primary/5">
                                  Score: {audit.score}%
                                </Badge>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  {new Date(audit.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary group-hover:text-white transition-all h-10 w-10">
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-20 text-center text-muted-foreground">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-10" />
                      <p className="text-sm font-black uppercase tracking-widest opacity-40">No audits in history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-[0.2em] text-white">
                    <ShieldCheck className="w-4 h-4 text-primary" /> AI Strategy Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] text-muted-foreground font-normal leading-relaxed space-y-4">
                  <p>The technical analyzer dispatches agents to evaluate content quality across 40+ points:</p>
                  <ul className="space-y-2 list-none">
                    <li className="flex items-center gap-2 font-normal"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Heading Hierarchy Logic</li>
                    <li className="flex items-center gap-2 font-normal"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Meta CTR Optimization</li>
                    <li className="flex items-center gap-2 font-normal"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Semantic City Intent</li>
                    <li className="flex items-center gap-2 font-normal"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Schema.org Integration</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-xl border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-[0.2em] text-white">
                    <AlertTriangle className="w-4 h-4 text-primary" /> Strategic Intel
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] text-white/60 font-normal leading-relaxed italic">
                  Scanning competitor URLs reveals exactly where their technical strategy is weak. Use these insights to dominate local neighborhoods.
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
