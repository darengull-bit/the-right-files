
"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { mockVisibilityTrend } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * @fileOverview Visibility Trend Chart.
 * Final build stability check applied. Corrected tag parsing.
 */

export function VisibilityChart() {
  return (
    <Card className="col-span-1 lg:col-span-2 glass-card border-none shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-normal uppercase">Visibility Trend</CardTitle>
            <CardDescription className="font-normal">Brand market presence vs competitors</CardDescription>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-widest">Active Brand</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-widest">Market Avg</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockVisibilityTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#888', fontSize: 10, fontWeight: '400' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#888', fontSize: 10, fontWeight: '400' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--primary))', 
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ fontSize: '11px', fontWeight: '400', color: '#fff' }}
                labelStyle={{ fontWeight: '400', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', color: '#fff' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="visibility" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="competitor" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
