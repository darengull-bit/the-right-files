"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Trash2, Loader2, Shield } from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { audit } from "@/firebase/audit-logger";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TeamsPage() {
  const { user, profile, member, organization, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [newTeamName, setNewTeamName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const organizationId = profile?.organizationId;
  const isAdmin = member?.role === 'ADMIN';

  const teamsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return collection(db, "organizations", organizationId, "teams");
  }, [db, organizationId]);

  const { data: teams, isLoading: teamsLoading } = useCollection(teamsQuery);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName || !organizationId || !db || !user?.uid) return;

    if (!isAdmin) {
      toast({ variant: "destructive", title: "Forbidden", description: "Only admins can create teams." });
      return;
    }

    setIsAdding(true);
    const teamsRef = collection(db, "organizations", organizationId, "teams");
    
    addDocumentNonBlocking(teamsRef, {
      name: newTeamName,
      organizationId,
      createdAt: new Date().toISOString(),
    });

    audit(db, {
      organizationId,
      userId: user.uid,
      action: "TEAM_CREATED",
      entity: "Team",
      metadata: { teamName: newTeamName }
    });

    setNewTeamName("");
    setIsAdding(false);
    toast({ title: "Team created", description: `"${newTeamName}" has been added to the organization.` });
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (!organizationId || !db || !isAdmin || !user?.uid) return;
    const teamRef = doc(db, "organizations", organizationId, "teams", teamId);
    
    deleteDocumentNonBlocking(teamRef);

    audit(db, {
      organizationId,
      userId: user.uid,
      action: "TEAM_DELETED",
      entity: "Team",
      entityId: teamId,
      metadata: { teamName }
    });

    toast({ title: "Team deleted", description: "The team has been removed." });
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
              <p className="text-muted-foreground">Organize users into specialized SEO teams.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 glass-card border-none h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Create New Team</CardTitle>
                <CardDescription>Define a new functional group.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input 
                      id="teamName"
                      placeholder="e.g. Content Strategy"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="bg-muted/50 border-none h-11"
                      disabled={!isAdmin}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isAdding || !isAdmin}>
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                    Add Team
                  </Button>
                  {!isAdmin && <p className="text-[10px] text-rose-400 text-center">Admin permissions required.</p>}
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 glass-card border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Existing Teams</CardTitle>
                <CardDescription>Manage current sub-groups in <strong>{organization?.name}</strong>.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {teamsLoading ? (
                  <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : teams && teams.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Team Name</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((team) => (
                        <TableRow key={team.id} className="border-border">
                          <TableCell className="font-semibold">{team.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(team.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={!isAdmin}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                              onClick={() => handleDeleteTeam(team.id, team.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">No teams defined.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
