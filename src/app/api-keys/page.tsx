
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Plus, Trash2, Loader2, ShieldCheck, Ban, Copy, Check, Lock, AlertTriangle, Code, Terminal } from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc, orderBy } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
import { generateApiKeyAction } from "@/app/actions/api-keys";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageGuide } from "@/components/dashboard/page-guide";

export default function ApiKeysPage() {
  const { user, profile, member, organization, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [newKeyName, setNewKeyName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const organizationId = profile?.organizationId;
  const isAdmin = member?.role === 'org_owner' || member?.role === 'org_admin';
  const plan = organization?.plan || "FREE";
  const canAccessApi = hasFeature(plan, 'API_ACCESS');

  const apiKeysQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "apiKeys"),
      orderBy("createdAt", "desc")
    );
  }, [db, organizationId]);

  const { data: apiKeys, isLoading: keysLoading } = useCollection(apiKeysQuery);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !organizationId || !db || !user?.uid) return;

    if (!canAccessApi) {
      toast({ variant: "destructive", title: "Pro Required", description: "Access Management requires a Pro plan." });
      return;
    }

    setIsAdding(true);
    const result = await generateApiKeyAction(organizationId, newKeyName, user.uid);

    if (result.success && result.rawKey) {
      setNewlyCreatedKey(result.rawKey);
      setNewKeyName("");
      toast({ title: "Digital Key Created", description: "Save this key now! It won't be shown again." });
    } else {
      toast({ variant: "destructive", title: "Creation Failed", description: result.error || "Could not generate key." });
    }
    
    setIsAdding(false);
  };

  const handleRevokeKey = (keyId: string, keyName: string, isRevoked: boolean) => {
    if (!organizationId || !db || !isAdmin || !user?.uid) return;
    const keyRef = doc(db, "organizations", organizationId, "apiKeys", keyId);
    
    updateDocumentNonBlocking(keyRef, { revoked: !isRevoked });

    audit(db, {
      organizationId,
      userId: user.uid,
      action: isRevoked ? "KEY_REACTIVATED" : "KEY_REVOKED",
      resourceType: "AccessKey",
      resourceId: keyId,
      metadata: { keyName }
    });

    toast({ 
      title: isRevoked ? "Key Reactivated" : "Key Revoked", 
      description: `Access for ${keyName} has been updated.` 
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied", description: "Digital key copied to clipboard." });
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
              <h1 className="text-3xl font-black uppercase text-white tracking-tight">Access Management</h1>
              <p className="text-muted-foreground text-sm font-medium">Manage digital keys to access your business data from external tools.</p>
            </div>
            
            {!canAccessApi ? (
              <Button 
                onClick={() => router.push('/settings')}
                className="gap-2 rounded-xl h-12 bg-white text-black hover:bg-white/90 font-black uppercase text-xs tracking-widest px-6"
              >
                <Lock className="w-4 h-4" /> Upgrade to Pro
              </Button>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setNewlyCreatedKey(null);
              }}>
                <DialogTrigger asChild>
                  <Button disabled={!isAdmin} variant="trigger" className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20">
                    <div className="relative">
                      <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <span className="text-[11px]">Create Access Key</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-none max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Generate New Access Key</DialogTitle>
                    <DialogDescription>
                      {newlyCreatedKey 
                        ? "Make sure to copy your access key now. You won't be able to see it again!" 
                        : "Give your key a descriptive name to help you identify it later."}
                    </DialogDescription>
                  </DialogHeader>

                  {newlyCreatedKey ? (
                    <div className="space-y-6 py-4">
                      <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-400">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>One-time Secret</AlertTitle>
                        <AlertDescription>
                          For security reasons, we cannot show this key again. Store it safely in a password manager.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label>Your Access Key</Label>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-xl border border-white/5 font-mono text-sm break-all">
                          {newlyCreatedKey}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="shrink-0 h-8 w-8"
                            onClick={() => handleCopy(newlyCreatedKey, "new-key")}
                          >
                            {copiedId === "new-key" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-white" />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button onClick={() => setIsDialogOpen(false)} className="w-full h-11 font-black uppercase tracking-widest text-xs">
                        I have saved the key
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateKey}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="keyName">Key Name</Label>
                          <Input
                            id="keyName"
                            placeholder="e.g. Office Dashboard Sync"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="bg-muted/50 border-none h-11 rounded-xl"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isAdding} variant="trigger" className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20">
                          <div className="relative">
                            <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                              {isAdding ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Key className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                          <span className="text-[11px]">Generate Key</span>
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>

          <PageGuide 
            description="Manage unique digital credentials that allow external applications to securely interact with your AgentPro organizational data."
            steps={[
              "Provide a descriptive name for the new access key",
              "Generate the key and COPY it immediately (it will never be shown again)",
              "Include the key in the 'x-api-key' header of your outbound API requests",
              "Revoke keys instantly if a system is compromised"
            ]}
            tips={[
              "Identify unique keys for different tools (e.g., 'Reports Sync', 'Mobile App') to isolate access.",
              "Digital keys grant full programmatic access to your business data. Treat them like master passwords."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card border-none shadow-xl lg:col-span-2 overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-6 bg-white/5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm font-normal uppercase tracking-widest">Active Credentials</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!canAccessApi ? (
                  <div className="p-12 text-center space-y-4">
                    <Lock className="w-12 h-12 mx-auto opacity-10 text-white" />
                    <p className="text-muted-foreground font-medium">Access Management is a Pro feature. Please upgrade your plan to generate keys.</p>
                    <Button variant="outline" onClick={() => router.push('/settings')} className="font-black uppercase text-[10px] tracking-widest px-6 h-9">View Plans</Button>
                  </div>
                ) : keysLoading ? (
                  <div className="p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : apiKeys && apiKeys.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest">Key Name</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Preview</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Created</TableHead>
                        <TableHead className="text-right pr-6 font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((k) => (
                        <TableRow key={k.id} className="border-border hover:bg-white/5 transition-colors">
                          <TableCell className="pl-6 font-black uppercase text-xs text-white">{k.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 font-mono text-[10px] bg-white/5 px-3 py-1.5 rounded-lg w-fit text-white">
                              <span>{k.revoked ? "••••••••••••" : `${k.prefix}...`}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {k.revoked ? (
                              <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-black uppercase tracking-widest px-2">
                                REVOKED
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2">
                                ACTIVE
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                            {new Date(k.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!isAdmin}
                              onClick={() => handleRevokeKey(k.id, k.name, k.revoked)}
                              className={k.revoked ? "text-primary hover:text-white font-black uppercase text-[9px] tracking-widest" : "text-white hover:text-rose-400 font-black uppercase text-[9px] tracking-widest"}
                            >
                              {k.revoked ? "Reactivate" : "Revoke"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-10 text-white" />
                    <p className="font-black uppercase text-xs tracking-widest">No access keys generated.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-white" />
                  <CardTitle className="text-sm font-normal uppercase tracking-widest">Quickstart Guide</CardTitle>
                </div>
                <CardDescription>How to use your digital keys.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Secure Access</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Identify your agency requests by including your unique key in the <code className="text-primary font-black">x-api-key</code> header of your requests.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Example Header</span>
                    <Code className="w-3 h-3" />
                  </div>
                  <pre className="text-[10px] font-mono text-primary overflow-x-auto">
{`x-api-key: YOUR_KEY_HERE`}
                  </pre>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    Keys provide full access to your organization's business intelligence. Never share these keys in public.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
