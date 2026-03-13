"use client"

import { useState, useMemo } from "react";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Loader2, 
  Globe, 
  Receipt, 
  Plus,
  ShieldCheck,
  Lock,
  Code,
  Copy,
  Zap,
  Activity,
  TrendingUp,
  Clock,
  Package
} from "lucide-react";
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { createCheckoutSession } from "@/app/actions/stripe";
import { registerSiteAction } from "@/app/actions/content";
import { useToast } from "@/hooks/use-toast";
import { Plan, PLANS, calculateEstimatedInvoice } from "@/lib/features";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function SettingsPage() {
  const { user, organization, profile: userProfile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isConnectingSite, setIsConnectingSite] = useState(false);

  const [siteUrl, setSiteUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpPassword, setWpPassword] = useState("");
  const [platform, setPlatform] = useState<"wordpress" | "shopify" | "custom" | "kvcore" | "lofty">("wordpress");
  const [seoPlugin, setSeoPlugin] = useState<"yoast" | "rankmath" | "none">("none");

  const periodId = useMemo(() => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  }, []);

  const summaryRef = useMemoFirebase(() => {
    if (!db || !organization?.id) return null;
    return doc(db, "organizations", organization.id, "usage_summaries", periodId);
  }, [db, organization?.id, periodId]);

  const { data: usageSummary } = useDoc(summaryRef);

  const membersQuery = useMemoFirebase(() => {
    if (!db || !organization?.id) return null;
    return collection(db, "organizations", organization.id, "members");
  }, [db, organization?.id]);

  const { data: members } = useCollection(membersQuery);

  const aiCreditsUsed = usageSummary?.aiCreditsUsed || usageSummary?.totals?.AI_CREDIT || 0;
  const currentPlan = (organization?.plan?.toLowerCase() || "starter") as Plan;
  const planConfig = PLANS[currentPlan];

  // Logic: 1 Task = 1 Credit. Agency Labor value saved: $50 per task.
  const valueRealized = useMemo(() => {
    const hoursSaved = aiCreditsUsed * 0.5; // 30 mins per task
    const dollarsSaved = aiCreditsUsed * 50; // $50 human value per task
    return { hoursSaved: Math.round(hoursSaved), dollarsSaved: Math.round(dollarsSaved) };
  }, [aiCreditsUsed]);

  const estimatedBilling = useMemo(() => {
    if (organization) {
      const activeAgents = members?.length || 1;
      return calculateEstimatedInvoice(organization.plan, activeAgents, aiCreditsUsed);
    }
    return null;
  }, [organization, aiCreditsUsed, members]);

  const handleConnectSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id || !siteUrl) return;

    setIsConnectingSite(true);
    const result = await registerSiteAction(
      organization.id,
      siteUrl,
      platform,
      platform === 'wordpress' ? wpUsername : undefined,
      platform === 'wordpress' ? wpPassword : undefined,
      platform === 'wordpress' ? seoPlugin : 'none'
    );

    if (result.success) {
      toast({ title: "Website Registered", description: `AgentPro will now monitor your business site at ${siteUrl}.` });
      setSiteUrl("");
      setWpUsername("");
      setWpPassword("");
    } else {
      toast({ variant: "destructive", title: "Connection Failed", description: result.error });
    }
    setIsConnectingSite(false);
  };

  const handleUpgrade = async () => {
    if (user?.uid && user?.email) {
      setIsCheckoutLoading(true);
      try {
        const { url } = await createCheckoutSession(user.uid, user.email);
        if (url) window.location.href = url;
      } catch (err: any) {
        toast({ variant: "destructive", title: "Checkout Error", description: "Could not initiate payment." });
      } finally {
        setIsCheckoutLoading(false);
      }
    }
  };

  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    toast({ title: "Copied!", description: "Connection script copied to clipboard." });
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground">Manage your business profile, billing, and autonomous website connectors.</p>
          </div>

          <Tabs defaultValue="websites" className="space-y-6">
            <TabsList className="bg-muted/50 border border-white/5 p-1 rounded-xl">
              <TabsTrigger value="websites" className="rounded-lg px-6 py-2">Websites</TabsTrigger>
              <TabsTrigger value="billing" className="rounded-lg px-6 py-2">Billing</TabsTrigger>
              <TabsTrigger value="general" className="rounded-lg px-6 py-2">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="websites" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 glass-card border-none shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      <CardTitle>Autonomous Connector</CardTitle>
                    </div>
                    <CardDescription>Link your business site to enable SEO monitoring and automated sync.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleConnectSite} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Platform</Label>
                          <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                            <SelectTrigger className="bg-muted/50 border-none h-11">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wordpress">WordPress (Auto-Sync)</SelectItem>
                              <SelectItem value="lofty">Lofty (Script-Sync)</SelectItem>
                              <SelectItem value="kvcore">kvCORE (Script-Sync)</SelectItem>
                              <SelectItem value="shopify">Shopify (Manual)</SelectItem>
                              <SelectItem value="custom">Custom (Script-Sync)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Business Website URL</Label>
                          <Input 
                            placeholder="https://yourbusiness.com" 
                            value={siteUrl}
                            onChange={(e) => setSiteUrl(e.target.value)}
                            className="bg-muted/50 border-none h-11"
                            required
                          />
                        </div>
                      </div>

                      {platform === 'wordpress' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>SEO Plugin</Label>
                            <Select value={seoPlugin} onValueChange={(v: any) => setSeoPlugin(v)}>
                              <SelectTrigger className="bg-muted/50 border-none h-11">
                                <SelectValue placeholder="Select plugin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yoast">Yoast SEO</SelectItem>
                                <SelectItem value="rankmath">RankMath</SelectItem>
                                <SelectItem value="none">Standard Meta</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                              <Lock className="w-3 h-3" /> Secure REST API Access
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs">WP Username</Label>
                                <Input 
                                  placeholder="admin" 
                                  value={wpUsername}
                                  onChange={(e) => setWpUsername(e.target.value)}
                                  className="bg-background/50 border-white/5 h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Application Password</Label>
                                <Input 
                                  type="password"
                                  placeholder="xxxx xxxx xxxx xxxx" 
                                  value={wpPassword}
                                  onChange={(e) => setWpPassword(e.target.value)}
                                  className="bg-background/50 border-white/5 h-10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {(platform === 'lofty' || platform === 'kvcore' || platform === 'custom') && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                            <Code className="w-3 h-3" /> HTML Connection Code
                          </div>
                          <div className="space-y-2">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              To enable automation for your <strong>{platform.toUpperCase()}</strong> business site, copy the script below and add it to your site's header script area.
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-primary break-all relative group">
                              <code>&lt;script src="https://api.agentpro.io/connector.js?id={organization?.id || 'ORG_ID'}"&gt;&lt;/script&gt;</code>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 shrink-0 ml-auto"
                                onClick={() => handleCopyScript(`<script src="https://api.agentpro.io/connector.js?id=${organization?.id || 'ORG_ID'}"></script>`)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button type="submit" disabled={isConnectingSite} className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-bold gap-2">
                        {isConnectingSite ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        {platform === 'wordpress' ? 'Connect Business Site' : `Register ${platform.toUpperCase()} Site`}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Feature Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                      <p>• <strong>WP Sync:</strong> Native REST API automation for your business.</p>
                      <p>• <strong>Script Sync:</strong> Automation for custom business sites via Header Script.</p>
                      <p>• <strong>Ai Proposals:</strong> Available for ALL business platforms.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-primary">
                          <TrendingUp className="w-4 h-4" />
                          <CardTitle className="text-xs font-black uppercase tracking-widest">Market Value Reclaimed</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-black text-white">${valueRealized.dollarsSaved.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Value of automated AI labor</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Clock className="w-4 h-4" />
                          <CardTitle className="text-xs font-black uppercase tracking-widest">Time Reclaimed</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-black text-white">{valueRealized.hoursSaved} hrs</div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Agency hours saved via AI</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="glass-card border-none shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle>AI Task Utilization</CardTitle>
                          <CardDescription>1 Credit = 1 AI Job Task</CardDescription>
                        </div>
                        <Badge variant="outline" className="h-8 px-4 text-primary border-primary/20 bg-primary/5 uppercase font-black tracking-widest text-[10px]">
                          {organization?.plan || 'Starter'} Tier
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary fill-current" />
                            <span>Monthly Task Quota</span>
                          </div>
                          <span>{aiCreditsUsed.toLocaleString()} / {planConfig.aiCredits.toLocaleString()}</span>
                        </div>
                        <Progress value={(aiCreditsUsed / planConfig.aiCredits) * 100} className="h-2 bg-white/5" />
                        <div className="p-4 rounded-xl bg-muted/20 border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-primary" />
                            <div className="space-y-0.5">
                              <p className="text-xs font-black uppercase">Need more tasks?</p>
                              <p className="text-[10px] text-muted-foreground font-medium">Add a 100-task bundle for $50 anytime.</p>
                            </div>
                          </div>
                          <Button variant="secondary" size="sm" className="text-[10px] font-black h-8 px-4">Buy Bundle</Button>
                        </div>
                      </div>

                      {estimatedBilling && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-5 bg-muted/20 rounded-2xl border border-white/5 shadow-inner">
                            <div className="space-y-1">
                              <p className="font-black uppercase tracking-widest text-xs">Projected Monthly Total</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">Includes base plan + metered overages</p>
                            </div>
                            <p className="text-3xl font-black text-white">${estimatedBilling.total.toFixed(2)}</p>
                          </div>
                          
                          {estimatedBilling.overageAiCredits > 0 && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/20 flex items-center gap-3">
                              <Activity className="w-5 h-5 text-white" />
                              <div className="text-[11px] text-white/80 font-medium">
                                <strong>Metered Overages:</strong> You have exceeded your plan credits. Extra tasks are billed at <strong>$0.50 per task</strong> ($50/bundle).
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="bg-muted/30 py-6 flex flex-col items-start gap-4">
                      <Button onClick={handleUpgrade} disabled={isCheckoutLoading} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20">
                        {isCheckoutLoading ? <Loader2 className="animate-spin" /> : <CreditCard className="w-6 h-6" />}
                        Manage Business Billing
                      </Button>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] font-black w-full justify-center">
                        <Receipt className="w-3 h-3" /> Secure Stripe Invoicing Active
                      </div>
                    </CardFooter>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-current" /> Yearly Bonus
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-white/60 leading-relaxed font-medium">
                      Switch to annual billing to unlock <strong>3x the monthly AI task quota</strong> and save 20% on the base seat price.
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest h-9">
                        View Annual Savings
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="general" className="space-y-8">
              <Card className="glass-card border-none shadow-xl">
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                  <CardDescription>Manage your business display name and contact details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Business Display Name</Label>
                      <Input defaultValue={userProfile?.name || ""} className="bg-muted/50 border-none h-11" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Primary Email</Label>
                      <Input disabled value={user?.email || ""} className="bg-muted/30 border-none h-11 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
