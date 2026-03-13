
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, ChevronUp, ChevronDown, Plus, Loader2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { audit } from "@/firebase/audit-logger";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getPlanConfig } from "@/lib/features";
import { PageGuide } from "@/components/dashboard/page-guide";
import { cn } from "@/lib/utils";

export default function KeywordsPage() {
  const { user, profile, member, organization, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [newKeyword, setNewKeyword] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const organizationId = profile?.organizationId;
  const userRole = member?.role;
  const planConfig = getPlanConfig(organization?.plan);

  const keywordsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "keywords"),
      orderBy("position", "asc")
    );
  }, [db, organizationId]);

  const { data: keywords, isLoading: keywordsLoading } = useCollection(keywordsQuery);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword || !organizationId || !db || !user?.uid) return;

    if (userRole === 'VIEWER' || userRole === 'readonly_user') {
      toast({ variant: "destructive", title: "Forbidden", description: "You do not have permission to add keywords." });
      return;
    }

    if (keywords && keywords.length >= planConfig.keywords) {
      toast({ 
        variant: "destructive", 
        title: "Limit Reached", 
        description: `Your ${organization?.plan} plan is limited to ${planConfig.keywords} keywords. Please upgrade.` 
      });
      router.push("/settings");
      return;
    }

    setIsAdding(true);
    const keywordsRef = collection(db, "organizations", organizationId, "keywords");
    
    addDocumentNonBlocking(keywordsRef, {
      keyword: newKeyword,
      position: 101, 
      change: 0,
      volume: 0,
      organizationId,
      active: true, 
      frequency: "daily", 
      city: "Global", 
      domain: organization?.customDomain || "example.com",
      createdAt: new Date().toISOString(),
    });

    audit(db, {
      organizationId,
      userId: user.uid,
      action: "ADD_KEYWORD",
      resourceType: "Keyword",
      metadata: { keyword: newKeyword }
    });

    setNewKeyword("");
    setIsAdding(false);
    toast({ title: "Keyword added", description: `"${newKeyword}" is now being tracked.` });
  };

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isReadOnly = userRole === 'VIEWER' || userRole === 'readonly_user';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-body">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-normal uppercase text-white">Keyword Tracking</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground text-sm font-normal">
                  Using {keywords?.length || 0} of {planConfig.keywords} keywords on <strong>{organization?.plan || "Starter"}</strong> plan.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2 rounded-xl h-11 font-normal bg-white/5 border-white/10 hover:bg-white/10">
                <Download className="w-4 h-4 text-primary" /> Export CSV
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={isReadOnly} variant="trigger" className="h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
                    <div className="relative">
                      <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                        {isReadOnly ? <Lock className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <span className="text-[11px]">Add Keyword</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-none">
                  <DialogHeader>
                    <DialogTitle>Add New Keyword</DialogTitle>
                    <DialogDescription>
                      You are using {keywords?.length || 0}/{planConfig.keywords} slots.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddKeyword}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Keyword</Label>
                        <Input
                          id="name"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="e.g. real estate agents victoria"
                          className="col-span-3 bg-muted/50 border-none"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isAdding} variant="trigger" className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20">
                        <div className="relative">
                          <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                            {isAdding ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        <span className="text-[11px]">Track Keyword</span>
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <PageGuide 
            description="Real-time monitoring of your search engine ranking positions (SERP) across target markets."
            steps={[
              "Add target keywords specific to your neighborhood or niche",
              "Monitor 'Position' to see where you rank in the top 100",
              "Check 'Change' to identify recent upward or downward trends",
              "Export your data to CSV for performance reporting"
            ]}
            tips={[
              "Keywords update daily at 3:00 AM UTC. Use the 'Refresh' tool for on-demand checks.",
              "Rankings #1-3 capture over 60% of all search clicks."
            ]}
          />

          <Card className="glass-card border-none shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input placeholder="Filter keywords..." className="pl-10 h-11 rounded-xl bg-background border-none focus:ring-primary/50 font-normal" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {keywordsLoading ? (
                <div className="p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : keywords && keywords.length > 0 ? (
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="w-[300px] pl-6 font-normal uppercase text-[10px] tracking-widest">Keyword</TableHead>
                      <TableHead className="font-normal uppercase text-[10px] tracking-widest">Position</TableHead>
                      <TableHead className="font-normal uppercase text-[10px] tracking-widest">Change</TableHead>
                      <TableHead className="font-normal uppercase text-[10px] tracking-widest">Status</TableHead>
                      <TableHead className="text-right pr-6 font-normal uppercase text-[10px] tracking-widest">Difficulty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords.map((k) => (
                      <TableRow key={k.id} className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                        <TableCell className="pl-6 font-normal py-5">
                          <div className="flex flex-col">
                            <span className="text-white uppercase font-normal">{k.keyword}</span>
                            <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-widest">{k.city} • {k.frequency}</span>
                          </div>
                        </TableCell>
                        <TableCell><span className="font-normal text-xl text-primary">#{k.position || 101}</span></TableCell>
                        <TableCell>
                          {k.change !== 0 ? (
                            <span className={cn(
                              "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-normal text-white shadow-md w-fit",
                              "bg-primary"
                            )}>
                              {k.change > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {Math.abs(k.change)}
                            </span>
                          ) : <span className="text-muted-foreground font-normal">--</span>}
                        </TableCell>
                        <TableCell>
                          {k.active ? (
                            <Badge variant="outline" className="text-[9px] font-normal border-primary/20 text-primary uppercase tracking-widest px-3">ACTIVE</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] font-normal border-white/20 text-white uppercase tracking-widest px-3">INACTIVE</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                           <Badge variant="outline" className="bg-primary/5 text-primary rounded-lg font-normal text-[10px] py-1 px-3 uppercase tracking-widest">LOW</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-muted-foreground font-normal">No keywords tracked yet.</div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
