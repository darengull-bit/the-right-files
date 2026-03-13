"use client"

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Globe, CheckCircle2, DollarSign } from "lucide-react";
import { Metric } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  metric: Metric;
}

export function StatsCard({ metric }: StatsCardProps) {
  const isPositive = metric.trend === 'up';

  const getIcon = (label: string) => {
    if (label.includes('Dominance')) return <Activity className="w-4 h-4 text-primary" />;
    if (label.includes('Listings')) return <Globe className="w-4 h-4 text-primary" />;
    if (label.includes('Score')) return <CheckCircle2 className="w-4 h-4 text-primary" />;
    return <DollarSign className="w-4 h-4 text-primary" />;
  };

  return (
    <Card className="glass-card overflow-hidden group hover:bg-card/80 transition-all duration-300 border-none shadow-lg transform hover:-translate-y-1 font-body">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-normal text-muted-foreground uppercase tracking-wider">{metric.label}</p>
          {getIcon(metric.label)}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-3xl font-normal tracking-tight">{metric.value}</h3>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-normal text-white"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3 text-primary" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
            <span className="text-white">
              {isPositive ? '+' : ''}{metric.change}%
            </span>
          </div>
        </div>
        <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000", isPositive ? "bg-primary" : "bg-rose-400")} 
            style={{ width: `${Math.min(Math.abs(metric.change) * 10, 100)}%` }} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
