"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Webhook, Plus, Trash2, Loader2, ShieldCheck, Copy, Check, Power, PowerOff, Lock, Filter } from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc, orderBy } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { hasFeature } from "@/lib/features";
import { Checkbox } from "@/components/ui/checkbox";
import { PageGuide } from "@/components/dashboard/page-guide";

const AVAILABLE_EVENTS = [
  "SEO_AUDIT_COMPLETED",
  "KEYWORD_RANK_UPDATED",
  "PAGESPEED_AUDIT_COMPLETED",
  "MEMBER_JOINED",
  "BILLING_THRESHOLD_REACHED"
];

export default function WebhooksPage() {
  const { user, profile, member, organization, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const organizationId = profile?.organizationId;
  const isAdmin = member?.role === 'org_owner' || member?.role === 'org_admin';
  const plan = organization?.plan || "FREE";
  const canAccessWebhooks = hasFeature(plan, 'WEBHOOK_ACCESS');

  const webhooksQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "webhookEndpoints"),
      orderBy("createdAt", "desc")
    );
  }, [db, organizationId]);

  const { data: webhooks, isLoading: webhooksLoading } = useCollection(webhooksQuery);

  const generateSecret = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !organizationId || !db || !user?.uid) return;

    if (!canAccessWebhooks) {
      toast({ variant: "destructive", title: "Pro Required", description: "Live Sync requires a Pro plan." });
      return;
    }

    if (!isAdmin) {
      toast({ variant: "destructive", title: "Forbidden", description: "Only admins can manage sync settings." });
      return;
    }

    setIsAdding(true);
    const webhooksRef = collection(db, "organizations", organizationId, "webhookEndpoints");
    
    addDocumentNonBlocking(webhooksRef, {
      url: newUrl,
      secret: `whsec_${generateSecret()}`,
      organizationId,
      eventTypes: selectedEvents,
      active: true,
      createdAt: new Date().toISOString(),
    });

    audit(db, {
      organizationId,
      userId: user.uid,
      action: "WEBHOOK_CREATED",
      resourceType: "WebhookEndpoint",
      metadata: { url: newUrl, eventTypes: selectedEvents }
    });

    setNewUrl("");
    setSelectedEvents([]);
    setIsAdding(false);
    toast({ title: "Sync Endpoint Created", description: "Your external system is now linked." });
  };

  const handleToggleEvent = (event: string) => {
    setSelectedEvents(prev => 
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  const handleToggleWebhook = (webhookId: string, url: string, currentStatus: boolean) => {
    if (!organizationId || !db || !isAdmin || !user?.uid) return;
    const webhookRef = doc(db, "organizations", organizationId, "webhookEndpoints", webhookId);
    
    updateDocumentNonBlocking(webhookRef, { active: !currentStatus });

    audit(db, {
      organizationId,
      userId: user.uid,
      action: !currentStatus ? "WEBHOOK_ACTIVATED" : "WEBHOOK_DEACTIVATED",
      resourceType: "WebhookEndpoint",
      resourceId: webhookId,
      metadata: { url }
    });

    toast({ 
      title: !currentStatus ? "Sync Activated" : "Sync Paused", 
      description: `Data flow for ${url} updated.` 
    });
  };

  const handleDeleteWebhook = (webhookId: string, url: string) => {
    if (!organizationId || !db || !isAdmin || !user?.uid) return;
    const webhookRef = doc(db, "organizations", organizationId, "webhookEndpoints", webhookId);
    
    deleteDocumentNonBlocking(webhookRef);

    audit(db, {
      organizationId,
      userId: user.uid,
      action: "WEBHOOK_DELETED",
      resourceType: "WebhookEndpoint",
      resourceId: webhookId,
      metadata: { url }
    });

    toast({ title: "Sync Connection Deleted", description: "Endpoint removed." });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied", description: "Verification secret copied." });
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
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-black uppercase text-white">Live Data Sync</h1>
              <p className="text-muted-foreground text-sm font-medium">Send real-time SEO updates directly to your business internal systems.</p>
            </div>

            {!canAccessWebhooks ? (
              <Button 
                onClick={() => router.push('/settings')}
                className="gap-2 rounded-xl h-12 bg-white text-black hover:bg-white/90 font-black uppercase text-xs tracking-widest px-6"
              >
                <Lock className="w-4 h-4" /> Upgrade to Pro
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={!isAdmin} className="gap-2 rounded-xl h-12 bg-primary hover:bg-primary/90 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 px-6">
                    <Plus className="w-4 h-4" /> Add Destination
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-none max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Link External System</DialogTitle>
                    <DialogDescription>
                      AgentPro will send data updates to this URL as they happen.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateWebhook} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Destination URL</Label>
                        <Input
                          id="url"
                          type="url"
                          placeholder="https://your-office-app.com/sync"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          className="bg-muted/50 border-none h-11 rounded-xl"
                          required
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <Filter className="w-4 h-4" /> Choose What to Sync
                        </Label>
                        <div className="grid grid-cols-1 gap-2 p-3 rounded-xl bg-muted/30 border border-white/5">
                          {AVAILABLE_EVENTS.map(event => (
                            <div key={event} className="flex items-center space-x-2">
                              <Checkbox 
                                id={event} 
                                checked={selectedEvents.includes(event)}
                                onCheckedChange={() => handleToggleEvent(event)}
                              />
                              <label htmlFor={event} className="text-xs font-black uppercase tracking-widest text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                {event.replace(/_/g, ' ')}
                              </label>
                            </div>
                          ))}
                          {selectedEvents.length === 0 && (
                            <p className="text-[10px] text-muted-foreground italic">No specific events selected (will sync everything by default).</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isAdding} className="w-full h-11 font-black uppercase tracking-widest text-xs rounded-xl bg-primary">
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Establish Sync"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <PageGuide 
            description="Broadcast internal AgentPro events to your custom web applications, office dashboards, or reporting tools in real-time."
            steps={[
              "Provide a reachable HTTP endpoint URL for your external system",
              "Select the specific data events you want to broadcast",
              "Click 'Establish Sync' to register the destination",
              "Verify the payload signature using the provided Security Key"
            ]}
            tips={[
              "Endpoints use HMAC SHA-256 signatures to ensure data authenticity.",
              "Broadcasting 'KEYWORD_RANK_UPDATED' allows you to build custom internal rank displays."
            ]}
          />

          <Card className="glass-card border-none shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-6 bg-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle className="text-sm font-normal uppercase tracking-widest">Active Connections</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!canAccessWebhooks ? (
                <div className="p-12 text-center space-y-4">
                  <Lock className="w-12 h-12 mx-auto opacity-10 text-white" />
                  <p className="text-muted-foreground font-medium">Live Sync is a Pro feature. Please upgrade your plan to register destinations.</p>
                  <Button variant="outline" onClick={() => router.push('/settings')} className="font-black uppercase text-[10px] tracking-widest px-6 h-9">View Plans</Button>
                </div>
              ) : webhooksLoading ? (
                <div className="p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : webhooks && webhooks.length > 0 ? (
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest">Destination</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Sync Items</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Security Key</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                      <TableHead className="text-right pr-6 font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map((w) => (
                      <TableRow key={w.id} className="border-border hover:bg-white/5 transition-colors">
                        <TableCell className="pl-6 font-black text-xs text-white max-w-[200px] truncate">{w.url}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {w.eventTypes && w.eventTypes.length > 0 ? (
                              w.eventTypes.slice(0, 2).map((e: string) => (
                                <Badge key={e} variant="secondary" className="text-[8px] px-1.5 py-0 font-black uppercase tracking-widest">
                                  {e.split('_')[0]}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-[8px] px-1.5 py-0 opacity-50 font-black uppercase tracking-widest text-white border-white/10">ALL</Badge>
                            )}
                            {w.eventTypes && w.eventTypes.length > 2 && (
                              <span className="text-[9px] text-muted-foreground font-black">+{w.eventTypes.length - 2}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 font-mono text-[10px] bg-white/5 px-3 py-1.5 rounded-lg w-fit text-white">
                            <span>{w.secret.substring(0, 12)}...</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleCopy(w.secret, w.id)}
                            >
                              {copiedId === w.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-white" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {w.active ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest">
                              ACTIVE
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-black uppercase tracking-widest">
                              PAUSED
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!isAdmin}
                            onClick={() => handleToggleWebhook(w.id, w.url, w.active)}
                            title={w.active ? "Pause sync" : "Resume sync"}
                            className="rounded-xl"
                          >
                            {w.active ? <PowerOff className="w-4 h-4 text-white" /> : <Power className="w-4 h-4 text-primary" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!isAdmin}
                            onClick={() => handleDeleteWebhook(w.id, w.url)}
                            className="text-white hover:text-rose-400 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                  <Webhook className="w-12 h-12 mx-auto mb-4 opacity-10 text-white" />
                  <p>No sync destinations established.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
