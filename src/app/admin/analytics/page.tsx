"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Loader2,
  ShieldCheck,
  Ban,
  CheckCircle2,
  MoreVertical,
  ShieldAlert,
  Server,
  DollarSign,
  Cpu
} from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { toggleUserSuspensionAction } from "@/app/actions/admin";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const systemPerformanceData = [
  { name: 'Mon', usage: 400 },
  { name: 'Tue', usage: 700 },
  { name: 'Wed', usage: 1100 },
  { name: 'Thu', usage: 1500 },
  { name: 'Fri', usage: 2100 },
  { name: 'Sat', usage: 2800 },
];

export default function AdminAnalyticsPage() {
  const { user, profile, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push("/login");
      } else if (profile?.role !== 'platform_admin') {
        router.push("/");
      }
    }
  }, [user, profile, isUserLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!db || profile?.role !== 'platform_admin') return null;
    return query(collection(db, "users"), limit(50));
  }, [db, profile?.role]);

  const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);

  const handleToggleSuspension = async (targetUser: any) => {
    if (!user?.uid) return;
    
    setProcessingId(targetUser.id);
    const result = await toggleUserSuspensionAction(user.uid, targetUser.id);

    if (result.success) {
      toast({
        title: result.newStatus ? "User Suspended" : "User Reactivated",
        description: `Account for ${targetUser.email} has been updated.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: result.error || "Could not update user status.",
      });
    }
    setProcessingId(null);
  };

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || profile?.role !== 'platform_admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 opacity-20" />
        <h1 className="text-2xl font-bold">403 - Forbidden</h1>
        <p className="text-muted-foreground">Access Restricted to platform_admin.</p>
        <Button onClick={() => router.push("/")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-white" />
                <h1 className="text-3xl font-bold tracking-tight">Platform Oversight</h1>
              </div>
              <p className="text-muted-foreground">Global administration and user management.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Total Managed Users</CardTitle>
                <Users className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allUsers?.length || 0}</div>
                <p className="text-[10px] text-primary mt-1 font-bold">Active in registry</p>
              </CardContent>
            </Card>
            
            {/* OPERATIONAL COGS CARD */}
            <Card className="glass-card border-none bg-primary/5 border border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase text-primary">Operational COGS</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.0004 / task</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-bold">AI + SERP AVG COST</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Logic Load</CardTitle>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Nominal</div>
                <p className="text-[10px] text-emerald-400 mt-1 font-bold">Under 10% capacity</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Global Health</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-[10px] text-emerald-400 mt-1 font-bold">Services stable</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-none shadow-xl">
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Oversight for registered platform users.</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>User</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers?.map((u) => (
                      <TableRow key={u.id} className="border-border">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{u.name || "Anonymous"}</span>
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{u.organizationId?.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            {u.plan || "FREE"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.suspended ? (
                            <Badge variant="destructive" className="flex items-center w-fit gap-1 text-[10px]">
                              <Ban className="w-3 h-3" /> SUSPENDED
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center w-fit gap-1 text-[10px] text-emerald-400 border-emerald-400/20">
                              <CheckCircle2 className="w-3 h-3" /> ACTIVE
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {processingId === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className={u.suspended ? "text-emerald-400" : "text-rose-400"}
                                  onClick={() => handleToggleSuspension(u)}
                                >
                                  {u.suspended ? "Reactivate Account" : "Suspend Account"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-none shadow-xl">
              <CardHeader>
                <CardTitle>System Utilization</CardTitle>
                <CardDescription>Usage trends across all tenants</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={systemPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{fill: '#888', fontSize: 10}} axisLine={false} />
                    <YAxis tick={{fill: '#888', fontSize: 10}} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="usage" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-xl">
              <CardHeader>
                <CardTitle>Platform Maintenance</CardTitle>
                <CardDescription>Direct logs from the background worker</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="text-center space-y-2 opacity-40">
                  <Server className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">No active system alerts</p>
                  <p className="text-[10px]">All infrastructure monitoring is nominal.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
