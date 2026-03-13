"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Search, 
  BarChart, 
  MapPin, 
  CheckCircle2, 
  Loader2, 
  ExternalLink, 
  Zap,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { PageGuide } from "@/components/dashboard/page-guide";
import { initiateGoogleConnection } from "@/app/actions/google-auth";

const GOOGLE_TOOLS = [
  {
    id: "gsc",
    name: "Search Console",
    description: "Monitor search traffic, index status, and keyword visibility.",
    icon: Search,
    color: "#4285F4",
    required: true
  },
  {
    id: "ga4",
    name: "Analytics 4",
    description: "Track user behavior, conversions, and organic session data.",
    icon: BarChart,
    color: "#E37400",
    required: true
  },
  {
    id: "gbp",
    name: "Business Profile",
    description: "Manage your local business presence and Map Pack visibility.",
    icon: MapPin,
    color: "#34A853",
    required: true
  },
  {
    id: "gmaps",
    name: "Maps API",
    description: "Enable high-frequency regional ranking heatmaps.",
    icon: Globe,
    color: "#EA4335",
    required: false
  }
];

export default function GoogleIntegrationsPage() {
  const { user, profile, organization, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  const handleConnect = async (toolId: string) => {
    if (!organization?.id) return;
    
    setIsConnecting(toolId);
    try {
      // Use the existing Google OAuth action
      await initiateGoogleConnection(organization.id);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to initialize Google authorization."
      });
      setIsConnecting(null);
    }
  };

  if (isUserLoading || !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const isConnected = organization?.googleConnected || false;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-black uppercase text-white">Google Integrations</h1>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Connect official Google data sources to enable live SEO monitoring.</p>
            </div>

            {isConnected ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5 py-1.5 px-4 rounded-xl">
                <ShieldCheck className="w-4 h-4" /> SECURE DATA SYNC ACTIVE
              </Badge>
            ) : (
              <Badge variant="outline" className="border-white/10 text-white bg-white/5 gap-1.5 py-1.5 px-4 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-primary" /> CONNECTION REQUIRED
              </Badge>
            )}
          </div>

          <PageGuide 
            description="Authorize AgentPro to securely access your business data from official Google repositories. This connection is required for 'Live Data Sync' and Map Pack monitoring."
            steps={[
              "Select 'Connect Account' to launch the secure Google OAuth flow",
              "Sign in with the Google Account that manages your search properties",
              "Authorize 'Search Console' and 'Business Profile' read access",
              "Verify the 'Active' status in your connection dashboard"
            ]}
            tips={[
              "Using a single Google Workspace account for all business properties simplifies the sync process.",
              "Search Console data is cached for 24 hours to maintain 99%+ operational efficiency."
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GOOGLE_TOOLS.map((tool) => (
              <Card key={tool.id} className="glass-card border-none overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-white/5" style={{ color: tool.color }}>
                      <tool.icon className="w-6 h-6" />
                    </div>
                    {isConnected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                    )}
                  </div>
                  <CardTitle className="text-sm font-normal uppercase text-white tracking-widest">{tool.name}</CardTitle>
                  <CardDescription className="text-[11px] leading-relaxed font-medium min-h-[32px]">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant={isConnected ? "outline" : "default"}
                    disabled={isConnected || isConnecting === tool.id}
                    onClick={() => handleConnect(tool.id)}
                    className={`w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                      isConnected 
                        ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10" 
                        : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    }`}
                  >
                    {isConnecting === tool.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isConnected ? (
                      "Service Connected"
                    ) : (
                      "Connect Account"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none shadow-xl lg:col-span-2">
              <CardHeader className="bg-white/5 border-b border-white/5">
                <CardTitle className="text-xs font-normal uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Integration Status Registry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Search className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase">Search Console API</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Querying live organic performance</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={isConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "opacity-40"}>
                    {isConnected ? "ACTIVE" : "OFFLINE"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <BarChart className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase">Analytics Data Streams</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Ingesting GA4 event dimensions</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={isConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "opacity-40"}>
                    {isConnected ? "ACTIVE" : "OFFLINE"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase">Business Profile Sync</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Local SEO and Map Pack authority</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={isConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "opacity-40"}>
                    {isConnected ? "ACTIVE" : "OFFLINE"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xs font-normal uppercase tracking-widest text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] text-muted-foreground leading-relaxed font-medium space-y-4">
                  <p>AgentPro uses **OAuth 2.0** to establish a secure link. We never store your Google password.</p>
                  <p>Access is restricted to **Read-Only** for search data, ensuring your account configurations remain untouched.</p>
                  <div className="pt-2 flex items-center gap-2 text-[9px] font-black uppercase text-primary">
                    <ExternalLink className="w-3 h-3" /> Security Whitepaper
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[10px] font-normal uppercase tracking-[0.2em] text-muted-foreground">Troubleshooting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-white uppercase">
                    Verification Pending
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    If your site doesn't appear after connecting, ensure you have **Owner** or **Full User** permissions in your Google Search Console account.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
