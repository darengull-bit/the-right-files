
"use client"

import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Laptop, Smartphone, Monitor, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";

export default function SecurityPage() {
  const { user } = useUser();
  const db = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "sessions");
  }, [db, user?.uid]);

  const { data: sessions, isLoading } = useCollection(sessionsQuery);

  const handleRevoke = (sessionId: string) => {
    if (!db || !user?.uid) return;
    const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
    deleteDocumentNonBlocking(sessionRef);
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile")) return <Smartphone className="w-4 h-4" />;
    if (userAgent.includes("Mac") || userAgent.includes("Windows")) return <Laptop className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security & Sessions</h1>
            <p className="text-muted-foreground">Manage your active devices and security logs.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="glass-card border-none shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <CardTitle>Active Devices</CardTitle>
                </div>
                <CardDescription>Devices currently logged into your account.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : sessions && sessions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Device</TableHead>
                        <TableHead>Location/IP</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id} className="border-border">
                          <TableCell className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              {getDeviceIcon(session.userAgent || "")}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{session.device || "Unknown Device"}</span>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{session.userAgent}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{session.ipAddress || "Unknown"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(session.lastActive).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-[10px]">
                              ACTIVE
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                              onClick={() => handleRevoke(session.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">No active sessions tracked.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
