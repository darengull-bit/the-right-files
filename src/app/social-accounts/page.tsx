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
  Share2, 
  Plus, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2, 
  Key,
  Instagram,
  Facebook,
  Linkedin,
  Twitter
} from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { audit } from "@/firebase/audit-logger";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { registerSocialAccountAction } from "@/app/actions/social";
import { PageGuide } from "@/components/dashboard/page-guide";

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook Business', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram Professional', icon: Instagram, color: '#E4405F' },
  { id: 'linkedin', name: 'LinkedIn Page', icon: Linkedin, color: '#0A66C2' },
  { id: 'twitter', name: 'X (Twitter) Business', icon: Twitter, color: '#000000' },
  { id: 'buffer', name: 'Buffer (All-in-One)', icon: Share2, color: '#000000' },
];

export default function SocialConnectPage() {
  const { user, profile, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [provider, setProvider] = useState<string>("");
  const [token, setToken] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const organizationId = profile?.organizationId;

  const socialQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "social_accounts"),
      orderBy("createdAt", "desc")
    );
  }, [db, organizationId]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(socialQuery);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !token || !organizationId || !user?.uid) return;

    setIsAdding(true);
    const result = await registerSocialAccountAction(
      organizationId, 
      provider as any, 
      token, 
      user.uid
    );

    if (result.success) {
      toast({ title: "Social Connect Successful", description: `Successfully linked your business profile.` });
      setIsDialogOpen(false);
      setProvider("");
      setToken("");
    } else {
      toast({ variant: "destructive", title: "Connection failed", description: result.error });
    }
    setIsAdding(false);
  };

  const openConnectDialog = (platformId: string) => {
    setProvider(platformId);
    setIsDialogOpen(true);
  };

  const handleDelete = (accountId: string, providerName: string) => {
    if (!organizationId || !db || !user?.uid) return;
    const accountRef = doc(db, "organizations", organizationId, "social_accounts", accountId);
    
    deleteDocumentNonBlocking(accountRef);

    audit(db, {
      organizationId,
      userId: user.uid,
      action: "SOCIAL_ACCOUNT_REMOVED",
      resourceType: "SocialAccount",
      resourceId: accountId,
      metadata: { provider: providerName }
    });

    toast({ title: "Social profile removed", description: "The connection has been terminated." });
  };

  const getPlatformIcon = (id: string) => {
    const platform = PLATFORMS.find(p => p.id === id);
    if (!platform) return <Share2 className="w-4 h-4" />;
    return <platform.icon className="w-4 h-4" style={{ color: platform.color }} />;
  };

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-black tracking-tight uppercase">Social Connect</h1>
            <p className="text-muted-foreground text-sm font-medium">Link your business profiles to enable automated search visibility.</p>
          </div>

          <PageGuide 
            description="Establish secure links between AgentPro and your social media business accounts to enable automated content delivery."
            steps={[
              "Select your target social platform from the branded connection boxes",
              "Obtain a professional access token or key from your platform provider",
              "Enter the key securely into the 'Connection Key' field",
              "Establish the connection and verify the 'Active' status"
            ]}
            tips={[
              "Buffer integration is the recommended path for managing all-in-one delivery.",
              "Keys are encrypted at rest using AES-256-GCM for enterprise-grade security."
            ]}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {PLATFORMS.map((platform) => {
              const isConnected = accounts?.some(acc => acc.provider === platform.id);
              return (
                <Card 
                  key={platform.id} 
                  className={`glass-card border-none transition-all hover:scale-[1.02] cursor-pointer group ${isConnected ? 'ring-1 ring-emerald-500/50' : ''}`}
                  onClick={() => openConnectDialog(platform.id)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 transition-colors group-hover:bg-white/10 relative">
                      <platform.icon className="w-8 h-8" style={{ color: platform.color }} />
                      {isConnected && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-[10px] uppercase tracking-widest text-white">{platform.name}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase">{isConnected ? 'Connected' : 'Click to Link'}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="glass-card border-none shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-6 bg-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle className="text-sm font-normal uppercase tracking-widest">Active Business Connections</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {accountsLoading ? (
                <div className="p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : accounts && accounts.length > 0 ? (
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest">Business Profile</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Last Sync</TableHead>
                      <TableHead className="text-right pr-6 font-black uppercase text-[10px] tracking-widest">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((acc) => (
                      <TableRow key={acc.id} className="border-border hover:bg-white/5 transition-colors">
                        <TableCell className="pl-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white/5">
                              {getPlatformIcon(acc.provider)}
                            </div>
                            <span className="font-black text-white uppercase text-xs">
                              {PLATFORMS.find(p => p.id === acc.provider)?.name || acc.provider.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5 py-1 text-[9px] font-black tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVE
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                          {new Date(acc.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(acc.id, acc.provider)}
                            className="text-white hover:text-rose-400 hover:bg-rose-400/10 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-16 text-center space-y-4">
                  <Share2 className="w-12 h-12 mx-auto opacity-10 text-white" />
                  <p className="font-black uppercase text-xs tracking-widest opacity-40 text-white">No business profiles connected</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="glass-card border-none max-w-xl">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl bg-white/5">
                    {getPlatformIcon(provider)}
                  </div>
                  <div>
                    <DialogTitle>Connect {PLATFORMS.find(p => p.id === provider)?.name}</DialogTitle>
                    <DialogDescription>Provide your business platform key to enable automated posting.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleRegister} className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="token" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Key className="w-3 h-3" /> Connection Key
                    </Label>
                    <Input
                      id="token"
                      type="password"
                      placeholder="Paste your API token or Access key here..."
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="bg-muted/50 border-none h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isAdding} className="w-full h-11 font-black uppercase tracking-widest text-xs rounded-xl bg-primary">
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Establish Connection"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
