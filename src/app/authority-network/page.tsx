
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
  ShieldCheck, 
  Plus, 
  Newspaper, 
  Globe, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  Search,
  ArrowRight,
  Sparkles,
  MoreVertical,
  Download,
  Share2
} from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { PageGuide } from "@/components/dashboard/page-guide";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPressReleaseAction } from "@/app/actions/authority";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AuthorityNetworkPage() {
  const { user, profile, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [announcement, setAnnouncement] = useState("");
  const [city, setCity] = useState("");
  const [points, setPoints] = useState(["", "", ""]);

  const organizationId = profile?.organizationId;

  const assetsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "authority_assets"),
      orderBy("createdAt", "desc")
    );
  }, [db, organizationId]);

  const { data: assets, isLoading: assetsLoading } = useCollection(assetsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !user?.uid) return;

    setIsGenerating(true);
    const result = await createPressReleaseAction(organizationId, user.uid, {
      announcementType: announcement,
      businessName: profile?.name || "Agency Pro",
      city: city || "Local Market",
      keyPoints: points.filter(p => p.trim() !== ""),
      contactInfo: {
        name: profile?.name || "Media Relations",
        email: user.email || "",
        phone: "555-0199"
      }
    });

    if (result.success) {
      toast({ title: "Authority Asset Ready", description: "Your press release has been archived in the network." });
      setIsDialogOpen(false);
      setAnnouncement("");
      setCity("");
      setPoints(["", "", ""]);
    } else {
      toast({ variant: "destructive", title: "Failed", description: result.error });
    }
    setIsGenerating(false);
  };

  if (isUserLoading || !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-black uppercase text-white">Authority Network</h1>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Generate and manage high-authority citations and news assets.</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="trigger" className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20">
                  <div className="relative">
                    <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-[11px]">New Press Release</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-none max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generate News Asset</DialogTitle>
                  <DialogDescription>Create an SEO-optimized press release for municipal distribution.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGenerate} className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Announcement Type</Label>
                      <Input placeholder="e.g. Market Milestone" value={announcement} onChange={e => setAnnouncement(e.target.value)} required className="bg-muted/50 border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Target City</Label>
                      <Input placeholder="e.g. Victoria, BC" value={city} onChange={e => setCity(e.target.value)} required className="bg-muted/50 border-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase">Key Points (for AI)</Label>
                    {points.map((p, i) => (
                      <Input key={i} placeholder={`Fact ${i+1}`} value={p} onChange={e => {
                        const newPoints = [...points];
                        newPoints[i] = e.target.value;
                        setPoints(newPoints);
                      }} className="bg-muted/50 border-none" />
                    ))}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isGenerating} variant="trigger" className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20">
                      <div className="relative">
                        <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                      <span className="text-[11px]">Generate Authority Asset</span>
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <PageGuide 
            description="The Authority Network manages high-value off-page SEO assets. Press releases and consistent citations prove your brand's expertise to LLMs and search engines."
            steps={[
              "Generate a new press release for a business milestone",
              "Verify the 'Answer-First' summary paragraph for SGE ingestion",
              "Export the markdown content for distribution to news wires",
              "Monitor the distribution status of your authority signals"
            ]}
            tips={[
              "Consistent NAP (Name, Address, Phone) in citations is the #1 signal for Map Pack dominance.",
              "Municipal news links provide the strongest E-E-A-T signals for local neighborhood ranking."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-normal uppercase tracking-widest">Authority Asset Registry</CardTitle>
                    <div className="relative w-48">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input placeholder="Filter assets..." className="pl-8 h-8 text-[10px] bg-background/50 border-none" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {assetsLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                  ) : assets && assets.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {assets.map((asset) => (
                        <div key={asset.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                              <Newspaper className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-black text-white uppercase truncate max-w-[300px]">{asset.title}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[8px] uppercase font-black border-primary/20 text-primary">
                                  {asset.type?.replace('_', ' ')}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground uppercase font-black">
                                  {new Date(asset.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <Download className="w-4 h-4 text-white" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <Share2 className="w-4 h-4 text-white" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-20 text-center space-y-4 opacity-40">
                      <Newspaper className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">No assets generated yet</p>
                      <Button variant="link" onClick={() => setIsDialogOpen(true)} className="text-primary font-bold">Generate your first press release</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xs font-normal flex items-center gap-2 uppercase tracking-widest text-white">
                    <Zap className="w-4 h-4 text-primary" /> Distribution Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
                      <span>NAP Consistency</span>
                      <span className="text-emerald-400">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
                      <span>Authority Backlinks</span>
                      <span className="text-primary">14 active</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '45%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-xl bg-white/5">
                <CardHeader>
                  <CardTitle className="text-xs font-normal uppercase tracking-[0.2em] text-white">Logic Update</CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  Our agents are currently scanning **municipal registries** and **local news portals** to verify your brand footprint. Authority assets are optimized for these crawlers.
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
