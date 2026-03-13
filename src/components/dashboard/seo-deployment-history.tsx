"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Zap } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

export function SeoDeploymentHistory({ organizationId, siteId }: { organizationId: string, siteId: string }) {
  const db = useFirestore();
  
  const historyQuery = useMemoFirebase(() => {
    if (!db || !organizationId || !siteId) return null;
    return query(
      collection(db, "organizations", organizationId, "site_integrations", siteId, "fix_history"),
      orderBy("deployedAt", "desc"),
      limit(20)
    );
  }, [db, organizationId, siteId]);

  const { data: history, isLoading } = useCollection(historyQuery);

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
        <Clock className="w-8 h-8 animate-pulse text-primary mb-2" />
        <p className="text-[10px] font-black uppercase tracking-widest">Retrieving logs...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Optimization Type</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Page Source</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest">Applied On</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6">Sync Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history && history.length > 0 ? (
            history.map((item) => (
              <TableRow key={item.id} className="border-border hover:bg-white/5 transition-colors">
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-black text-xs text-white uppercase">{item.changeType?.replace('_', ' ')}</span>
                    <span className="text-[9px] text-primary font-black uppercase tracking-widest flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 fill-current" /> AI ENABLED
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  <span className="text-xs font-mono text-muted-foreground">{item.pageUrl}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                    <Clock className="w-3 h-3" />
                    {new Date(item.deployedAt).toLocaleDateString()} {new Date(item.deployedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> VERIFIED
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic text-xs uppercase font-black tracking-widest opacity-20">
                No optimization history detected for this site.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
