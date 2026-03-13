"use client"

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { StatsCard } from "@/components/dashboard/stats-card";
import { VisibilityChart } from "@/components/dashboard/visibility-chart";
import { SeoWorkflowChecklist } from "@/components/dashboard/seo-workflow-checklist";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Globe, 
  ChevronRight, 
  AlertTriangle, 
  Activity,
  CheckCircle2,
  Cpu,
  Rocket,
  ShieldCheck,
  Plus,
  ArrowRight
} from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageGuide } from "@/components/dashboard/page-guide";
import { WelcomeModal } from "@/components/dashboard/welcome-modal";

export default function DashboardPage() {
  const { user, organization, profile, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const organizationId = organization?.id;
  const billingStatus = organization?.billing_status || "active";

  const metricsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return collection(db, "organizations", organizationId, "metrics");
  }, [db, organizationId]);

  const siteIntegrationsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return collection(db, "organizations", organizationId, "site_integrations");
  }, [db, organizationId]);

  const keywordsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return collection(db, "organizations", organizationId, "keywords");
  }, [db, organizationId]);

  const auditsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return collection(db, "organizations", organizationId, "seo_audits");
  }, [db, organizationId]);

  const templatesQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return collection(db, "organizations", organizationId, "custom_templates");
  }, [db, organizationId]);

  const socialAccountsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return collection(db, "organizations", organizationId, "social_accounts");
  }, [db, organizationId]);

  const postsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "social_posts")
    );
  }, [db, organizationId]);

  const { data: metrics } = useCollection(metricsQuery);
  const { data: sites } = useCollection(siteIntegrationsQuery);
  const { data: keywords } = useCollection(keywordsQuery);
  const { data: audits } = useCollection(auditsQuery);
  const { data: templates } = useCollection(templatesQuery);
  const { data: socialAccounts } = useCollection(socialAccountsQuery);
  const { data: posts } = useCollection(postsQuery);

  const workflowData = useMemo(() => {
    return {
      siteConnected: (sites?.length || 0) > 0,
      keywordsAdded: (keywords?.length || 0) > 0,
      googleConnected: organization?.googleConnected || false,
      auditsPerformed: (audits?.length || 0) > 0,
      templatesCreated: (templates?.length || 0) > 0,
      socialConnected: (socialAccounts?.length || 0) > 0,
      postsScheduled: (posts?.length || 0) > 0,
    };
  }, [sites, keywords, organization, audits, templates, socialAccounts, posts]);

  const isFullyReady = workflowData.siteConnected && workflowData.keywordsAdded && workflowData.googleConnected;

  if (isUserLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) return null;

  const displayMetrics = metrics && metrics.length > 0 ? [
    { label: 'Market Dominance', value: `${metrics[0].dominance}%`, change: 2.4, trend: 'up' as const },
    { label: 'Indexed Listings', value: metrics[0].listings?.toLocaleString() || '0', change: 12, trend: 'up' as const },
    { label: 'SEO Health Score', value: `${metrics[0].healthScore || 65}%`, change: 8.5, trend: 'up' as const },
  ] : [
    { label: 'Market Dominance', value: '42.5%', change: 2.1, trend: 'up' as const },
    { label: 'Heat Map Control', value: '68%', change: 1.2, trend: 'up' as const },
    { label: 'SEO Health Score', value: '65%', change: 8.5, trend: 'up' as const },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <WelcomeModal />
          
          {billingStatus !== "active" && (
            <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Billing Action Required</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Your subscription is currently <strong>{billingStatus.replace('_', ' ')}</strong>. AI features are restricted.</span>
                <Button variant="link" onClick={() => router.push('/settings')} className="text-rose-400 p-0 h-auto font-normal underline">Fix Billing</Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">Command Centre</h1>
              <p className="text-muted-foreground text-sm font-normal">Monitoring market dominance for <span className="text-primary">{organization?.name || "Business"}</span></p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Logic Engine: Active</span>
              </div>
              {isFullyReady ? (
                <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 py-1 px-3">
                  <Rocket className="w-3 h-3 text-primary" /> MARKET READY
                </Badge>
              ) : (
                <Badge variant="outline" className="border-white/20 text-white bg-white/5 gap-1.5 py-1 px-3">
                  <Activity className="w-3 h-3 text-primary" /> SETUP IN PROGRESS
                </Badge>
              )}
            </div>
          </div>

          <PageGuide 
            description="Your central dashboard for monitoring brand visibility, keyword performance, and search engine readiness."
            steps={[
              "Complete the Master Workflow to unlock full autonomous capabilities",
              "Connect your website in Settings to enable deep scanning",
              "Add target keywords to monitor daily position changes",
              "Review the Visibility Trend to compare your brand against market averages"
            ]}
            tips={[
              "The AI Advisor suggests commands based on your real-time integration status.",
              "A Health Score above 80% is recommended for competitive local markets."
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayMetrics.map(m => <StatsCard key={m.label} metric={m} />)}
          </div>

          {/* Master Workflow Checklist */}
          <SeoWorkflowChecklist data={workflowData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <VisibilityChart />
              
              <Card className="glass-card border-none shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-normal uppercase">Active Channels</CardTitle>
                    <CardDescription className="font-normal">Direct connections to your business platforms</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push('/settings')} 
                    variant="outline"
                    size="sm"
                    className="gap-2 border-white/10 bg-white/5 rounded-xl font-bold"
                  >
                    <Plus className="w-4 h-4 text-primary" /> Add Channel
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sites && sites.length > 0 ? (
                      sites.map(site => (
                        <div key={site.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => router.push(`/site/${site.id}`)}>
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-xl">
                              <Globe className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-normal text-white uppercase">{site.baseUrl.replace(/https?:\/\//, '')}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{site.platform}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary uppercase tracking-widest">SYNC ACTIVE</Badge>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-12 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                        <Globe className="w-12 h-12 mx-auto mb-4 text-primary opacity-20" />
                        <p className="text-muted-foreground text-sm font-normal">No sites connected yet.</p>
                        <Button variant="link" onClick={() => router.push('/settings')} className="text-primary font-bold">Link your business site now</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-normal flex items-center gap-2 uppercase tracking-[0.2em] text-white">
                      <Activity className="w-4 h-4 text-primary" /> System Health
                    </CardTitle>
                    <Badge className="bg-primary text-white text-[8px] font-black px-2">OPTIMAL</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">AI Flow Engine</span>
                    <span className="text-white flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-primary" /> VERIFIED
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">SERP Interface</span>
                    <span className="text-white flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-primary" /> VERIFIED
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-xl bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-xs font-normal text-white flex items-center gap-2 uppercase tracking-widest">
                    <Cpu className="w-4 h-4 text-primary" /> Autonomous Insight
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] text-muted-foreground/80 leading-relaxed font-normal">
                  {isFullyReady 
                    ? "AgentPro is currently monitoring local intent. AI confidence for the next batch of automated optimizations is high."
                    : "Complete the foundation steps in the Master Workflow to enable autonomous market monitoring and AI-driven site optimizations."}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
