"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { audit } from "@/firebase/audit-logger";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageGuide } from "@/components/dashboard/page-guide";

export default function WorkspacesPage() {
  const { user, profile, member, organization, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const organizationId = profile?.organizationId;
  const isAdmin = member?.role === 'ADMIN' || member?.role === 'org_owner';

  const workspacesQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return collection(db, "organizations", organizationId, "workspaces");
  }, [db, organizationId]);

  const { data: workspaces, isLoading: workspacesLoading } = useCollection(workspacesQuery);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName || !organizationId || !db || !user?.uid) return;

    if (!isAdmin) {
      toast({ variant: "destructive", title: "Forbidden", description: "Only Admins can create workspaces." });
      return;
    }

    setIsAdding(true);
    const workspacesRef = collection(db, "organizations", organizationId, "workspaces");
    
    addDocumentNonBlocking(workspacesRef, {
      name: newWorkspaceName,
      organizationId,
      createdAt: new Date().toISOString(),
    });

    audit(db, {
      organizationId,
      userId: user.uid,
      action: "WORKSPACE_CREATED",
      resourceType: "Workspace",
      metadata: { workspaceName: newWorkspaceName }
    });

    setNewWorkspaceName("");
    setIsAdding(false);
    toast({ title: "Workspace created", description: `"${newWorkspaceName}" has been added.` });
  };

  const handleDeleteWorkspace = (workspaceId: string, workspaceName: string) => {
    if (!organizationId || !db || !isAdmin || !user?.uid) return;
    const workspaceRef = doc(db, "organizations", organizationId, "workspaces", workspaceId);
    
    deleteDocumentNonBlocking(workspaceRef);

    audit(db, {
      organizationId,
      userId: user.uid,
      action: "WORKSPACE_DELETED",
      resourceType: "Workspace",
      resourceId: workspaceId,
      metadata: { workspaceName }
    });

    toast({ title: "Workspace deleted", description: "The workspace has been removed." });
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
              <h1 className="text-3xl font-black uppercase text-white">Workspaces</h1>
              <p className="text-muted-foreground text-sm font-medium">Manage offices or regional divisions within <strong>{organization?.name}</strong>.</p>
            </div>
          </div>

          <PageGuide 
            description="Workspaces allow multi-agent teams to segment tracking data by office, city, or niche."
            steps={[
              "Define a new workspace name (e.g., 'West Coast Office')",
              "Create the workspace using the 'Add Workspace' tool",
              "Review active workspaces in the management table",
              "Delete workspaces when divisions are consolidated"
            ]}
            tips={[
              "Admin permissions are required to create or delete workspaces.",
              "Keywords and sites can be segmented by workspace for granular reporting."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 glass-card border-none h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white">New Workspace</CardTitle>
                <CardDescription>Add an office or regional group.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspaceName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workspace Name</Label>
                    <Input 
                      id="workspaceName"
                      placeholder="e.g. West Coast Regional Office"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      className="bg-muted/50 border-none h-11 rounded-xl"
                      disabled={!isAdmin}
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-black uppercase text-xs tracking-widest" disabled={isAdding || !isAdmin}>
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Add Workspace
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 glass-card border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Active Workspaces</CardTitle>
                <CardDescription>Current sub-divisions of your organization.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {workspacesLoading ? (
                  <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : workspaces && workspaces.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5">
                        <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Created At</TableHead>
                        <TableHead className="text-right pr-6 font-black uppercase text-[10px] tracking-widest">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workspaces.map((workspace) => (
                        <TableRow key={workspace.id} className="border-white/5 hover:bg-white/5">
                          <TableCell className="pl-6 font-black uppercase text-xs text-white">{workspace.name}</TableCell>
                          <TableCell className="text-[10px] font-black uppercase text-muted-foreground">
                            {new Date(workspace.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={!isAdmin}
                              className="text-white hover:text-rose-400 hover:bg-rose-400/10 rounded-xl"
                              onClick={() => handleDeleteWorkspace(workspace.id, workspace.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest">No workspaces defined.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
