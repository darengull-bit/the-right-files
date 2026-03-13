"use client"

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Globe, 
  Zap, 
  ArrowLeft,
  Cpu,
  Search,
  Check,
  AlertTriangle,
  Info,
  Copy,
  History,
  LayoutGrid,
  Clock,
  Send
} from "lucide-react";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { SeoFixCard } from "@/components/dashboard/seo-fix-card";
import { SeoChange } from "@/modules/seo/ai/models/seo-change.model";
import { runAutopilotAction } from "@/app/actions/autopilot";
import { getSeoProposalsAction } from "@/app/actions/seo-proposals";
import { deploySeoOptimizationsAction } from "@/app/actions/seo-deployment";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoDeploymentHistory } from "@/components/dashboard/seo-deployment-history";

export default function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const { user, profile, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [isDeployingAll, setIsDeployingAll] = useState(false);
  const [fixes, setFixes] = useState<SeoChange[]>([]);
  const [currentScore, setCurrentScore] = useState(0);

  const siteRef = useMemoFirebase(() => {
    if (!db || !profile?.organizationId || !siteId) return null;
    return doc(db, "organizations", profile.organizationId, "site_integrations", siteId);
  }, [db, profile?.organizationId, siteId]);

  const { data: site, isLoading: siteLoading } = useDoc(siteRef);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  // Initial Scan
  useEffect(() => {
    if (site && fixes.length === 0 && !isScanning) {
      handleScanForFixes();
    }
  }, [site]);

  const handleScanForFixes = async () => {
    if (!profile?.organizationId || !siteId) return;
    setIsScanning(true);
    try {
      const result = await getSeoProposalsAction(profile.organizationId, siteId);
      if (result.success) {
        setFixes(result.proposals || []);
        if (result.score !== undefined) setCurrentScore(result.score);
      } else {
        toast({ variant: "destructive", title: "Scan Failed", description: result.error });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Failure", description: "Could not fetch SEO proposals." });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeployFix = async (change: SeoChange) => {
    if (!profile?.organizationId || !siteId) return;
    
    try {
      const result = await deploySeoOptimizationsAction(profile.organizationId, siteId, [change]);
      if (result.success) {
        toast({ title: "Fix Published", description: `Successfully updated ${change.pageUrl}` });
        handleScanForFixes();
      } else {
        toast({ variant: "destructive", title: "Manual Action Required", description: result.error });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Manual Mode", description: e.message || "Please use copy tools." });
    }
  };

  const handleDeployAll = async () => {
    if (!profile?.organizationId || !siteId || fixes.length === 0) return;

    const validFixes = fixes.filter(f => (f.confidence ?? 0) >= 0.60);
    
    if (validFixes.length === 0) {
      toast({ variant: "destructive", title: "Action Blocked", description: "No optimizations meet the 60% confidence threshold." });
      return;
    }

    setIsDeployingAll(true);
    try {
      const result = await deploySeoOptimizationsAction(profile.organizationId, siteId, validFixes);
      if (result.success) {
        toast({ 
          title: "Batch Publication Complete", 
          description: `Successfully published ${result.deployedCount} optimizations.` 
        });
        handleScanForFixes();
      } else {
        toast({ variant: "destructive", title: "Manual Sync Required", description: result.error });
      }
    } finally {
      setIsDeployingAll(false);
    }
  };

  const handleRunAutopilot = async () => {
    if (!profile?.organizationId || !user?.uid || !siteId) return;

    setIsScanning(true);
    try {
      const result = await runAutopilotAction(profile.organizationId, siteId, user.uid);
      if (result.success) {
        toast({ title: "Autopilot Complete", description: result.message });
        if (result.score !== undefined) setCurrentScore(result.score);
        setFixes([]); 
      } else {
        toast({ variant: "destructive", title: "Autopilot Error", description: result.error });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Failure", description: "Could not trigger Autopilot. Check plan limits." });
    } finally {
      setIsScanning(false);
    }
  };

  if (isUserLoading || siteLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!site) return <div className="p-12 text-center text-muted-foreground font-black uppercase text-xs tracking-widest opacity-40">Site Not Found</div>;

  const isAutomatedSyncSupported = site.platform === 'wordpress' && site.username;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-black uppercase text-white tracking-tight">{site.baseUrl.replace(/https?:\/\//, '')}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                    <Globe className="w-3 h-3 mr-1" /> {site.platform.toUpperCase()}
                  </Badge>
                  {!isAutomatedSyncSupported && (
                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20 gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                      <Copy className="w-3 h-3" /> MANUAL IMPLEMENTATION
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleScanForFixes} disabled={isScanning || isDeployingAll} className="gap-2 rounded-xl h-11 border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase text-[10px] tracking-widest px-6 shadow-xl">
                      {isScanning ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4 text-primary" />}
                      Scan Site
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Execute Technical SEO Audit</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleRunAutopilot} 
                      disabled={isScanning || isDeployingAll || !isAutomatedSyncSupported}
                      className={`gap-2 rounded-xl h-11 font-black uppercase text-[10px] tracking-widest px-6 shadow-lg transition-all active:scale-95 ${!isAutomatedSyncSupported ? 'opacity-50 grayscale' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
                    >
                      {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                      Run Autopilot
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isAutomatedSyncSupported ? 'Automated Audit + Live Fix Publication' : 'Autopilot requires WordPress Sync'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card border-none shadow-xl lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Market Health Index</CardTitle>
                <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Real-time performance score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative h-32 w-32">
                    <svg className="h-full w-full" viewBox="0 0 36 36">
                      <path
                        className="stroke-white/5"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="stroke-primary transition-all duration-1000 ease-out"
                        strokeWidth="3"
                        strokeDasharray={`${currentScore}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black text-white">{currentScore}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-primary mt-4 uppercase font-black tracking-widest">Visibility Verified</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Mobile Rendering</span>
                    <span className="text-white">82%</span>
                  </div>
                  <Progress value={82} className="h-1.5 bg-white/5" />
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Entity Mapping</span>
                    <span className="text-white">40%</span>
                  </div>
                  <Progress value={40} className="h-1.5 bg-white/5" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-xl lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6 bg-white/[0.02]">
                <div>
                  <CardTitle className="text-xl font-black uppercase text-white">Optimization Center</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground">Manage AI proposals and verify published changes</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {fixes.length > 0 && isAutomatedSyncSupported && (
                    <Button 
                      onClick={handleDeployAll} 
                      disabled={isDeployingAll || fixes.filter(f => (f.confidence ?? 0) >= 0.60).length === 0}
                      className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest h-9 px-4 rounded-xl gap-2 shadow-lg shadow-primary/20"
                    >
                      {isDeployingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Publish All Valid Changes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="proposals" className="w-full">
                  <TabsList className="bg-black/40 p-1 border border-white/5 rounded-xl mb-6">
                    <TabsTrigger value="proposals" className="rounded-lg px-6 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <LayoutGrid className="w-3.5 h-3.5" /> Pending Proposals
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg px-6 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Clock className="w-3.5 h-3.5" /> Publication Logs
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="proposals">
                    {!isAutomatedSyncSupported && (
                      <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                          <strong className="text-white">Manual Mode Active:</strong> Since this is a {site.platform || 'Custom'} site, automated "Direct Publication" is disabled. You can review and edit AI fixes, then use the <strong className="text-primary">Copy</strong> tools to update your site manually.
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      {fixes.length > 0 ? (
                        fixes.map((fix, i) => (
                          <SeoFixCard key={`${fix.pageUrl}-${fix.changeType}-${i}`} change={fix} onApply={handleDeployFix} />
                        ))
                      ) : (
                        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                          {isScanning ? (
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                          ) : (
                            <Zap className="w-12 h-12 mb-2 text-primary fill-current" />
                          )}
                          <p className="text-[10px] font-black uppercase tracking-widest text-white">
                            {isScanning ? "Analyzing page structures for gaps..." : "All optimizations verified and published"}
                          </p>
                          {!isScanning && (
                            <Button variant="outline" size="sm" onClick={handleScanForFixes} className="rounded-xl font-black uppercase text-[9px] tracking-widest h-9 px-6 border-white/10 hover:bg-white/5 text-white">Refresh Audit</Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    <SeoDeploymentHistory organizationId={profile?.organizationId} siteId={siteId} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
