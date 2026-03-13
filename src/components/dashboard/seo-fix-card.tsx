"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, Check, Loader2, AlertCircle, ShieldCheck, Send } from "lucide-react";
import { SeoChange } from "@/modules/seo/ai/models/seo-change.model";
import { SeoFixPreviewModal } from "./seo-fix-preview-modal";
import { useState } from "react";
import { useUser, useFirestore } from "@/firebase";

interface SeoFixCardProps {
  change: SeoChange;
  onApply: (change: SeoChange) => Promise<void>;
}

export function SeoFixCard({ change, onApply }: SeoFixCardProps) {
  const { profile } = useUser();
  const db = useFirestore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const confidence = change.confidence ?? 0;
  const isLowConfidence = confidence < 0.60;

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return "text-white bg-emerald-500 border-none";
    if (conf >= 0.75) return "text-white bg-primary border-none";
    return "text-white bg-gray-500 border-none";
  };

  const handleApply = async (updatedChange: SeoChange = change) => {
    if (isLowConfidence) return;
    setIsDeploying(true);
    try {
      await onApply(updatedChange);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      <Card className="glass-card border-none overflow-hidden group hover:bg-card/80 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-lg shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm uppercase tracking-tight text-white">
                    {change.changeType.replace('_', ' ')}
                  </h4>
                  <Badge className={`text-[9px] uppercase tracking-tighter px-2 py-0.5 font-normal rounded-full ${getConfidenceColor(confidence)}`}>
                    <ShieldCheck className="w-2.5 h-3 mr-1" /> {Math.round(confidence * 100)}% Confidence
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
                  {change.pageUrl}
                </p>
                
                {isLowConfidence ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold bg-rose-400/5 px-2 py-0.5 rounded-md w-fit mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Review Required: Low Confidence
                  </div>
                ) : (
                  <p className="text-xs text-foreground/80 line-clamp-1 mt-1 font-medium">
                    {change.notes || "AI-optimized optimization ready for publication."}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/5 bg-white/5 hover:bg-white/10"
                onClick={() => setIsPreviewOpen(true)}
                disabled={isDeploying}
              >
                <Eye className="w-4 h-4 mr-2 text-primary" />
                Review & Edit
              </Button>
              
              <Button 
                size="sm" 
                disabled={isDeploying || isLowConfidence}
                className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isLowConfidence 
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" 
                    : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                }`}
                onClick={() => handleApply()}
              >
                {isDeploying ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Publish
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SeoFixPreviewModal 
        isOpen={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen} 
        change={change} 
        onApply={handleApply}
      />
    </>
  );
}
