"use client"

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, AlertTriangle, X, ShieldCheck, Copy, Edit3, Save } from "lucide-react";
import { SeoChange, SeoChangeType } from "@/modules/seo/ai/models/seo-change.model";
import { useToast } from "@/hooks/use-toast";

interface SeoFixPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  change: SeoChange;
  onApply: (updatedChange: SeoChange) => void;
}

/**
 * @fileOverview SEO Fix Preview Modal with Edit-to-Publish capability.
 * 
 * Provides a high-fidelity comparison and allows agents to manually 
 * edit AI suggestions before publishing to the CMS.
 */
export function SeoFixPreviewModal({ isOpen, onOpenChange, change, onApply }: SeoFixPreviewModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for edits
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedJsonLd, setEditedJsonLd] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEditedTitle(change.after?.title || "");
      setEditedDescription(change.after?.description || "");
      setEditedJsonLd(JSON.stringify(change.after?.jsonLd, null, 2) || "");
      setIsEditing(false);
    }
  }, [isOpen, change]);

  const isMeta = change.changeType === SeoChangeType.META_UPDATE;
  const confidence = change.confidence ?? 0;
  const confidencePercent = Math.round(confidence * 100);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to Clipboard", description: `${label} is ready to paste into your site.` });
  };

  const handlePublish = () => {
    const updatedAfter = isMeta ? {
      ...change.after,
      title: editedTitle,
      description: editedDescription
    } : {
      ...change.after,
      jsonLd: JSON.parse(editedJsonLd)
    };

    onApply({
      ...change,
      after: updatedAfter
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-none max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <DialogTitle>Review & Publish Optimization</DialogTitle>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
              confidence >= 0.85 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/10 text-white border-white/20"
            }`}>
              <ShieldCheck className="w-3 h-3" /> {confidencePercent}% AI Confidence
            </div>
          </div>
          <DialogDescription>
            Audit target: <span className="text-foreground font-mono text-xs">{change.pageUrl}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Current State */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <AlertTriangle className="w-3 h-3" /> Current State
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-white/5 space-y-4 min-h-[250px]">
              {isMeta ? (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Meta Title</p>
                    <p className="text-xs line-through opacity-50 italic">
                      {change.before?.title || "No title tag detected"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Meta Description</p>
                    <p className="text-xs line-through opacity-50 italic">
                      {change.before?.description || "No description detected"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <X className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">No existing Schema detected.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Proposal / Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                <Sparkles className="w-3 h-3" /> {isEditing ? "Optimization Editor" : "AI Optimized"}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                className="h-7 px-2 text-[9px] font-black uppercase tracking-widest gap-1.5"
              >
                {isEditing ? <><Save className="w-3 h-3" /> Save Draft</> : <><Edit3 className="w-3 h-3" /> Edit Proposal</>}
              </Button>
            </div>

            <div className={`p-4 rounded-xl space-y-4 shadow-lg min-h-[250px] transition-all ${
              isEditing ? "bg-black/40 border border-primary/30" : "bg-emerald-500/5 border border-emerald-500/20 shadow-emerald-500/5"
            }`}>
              {isMeta ? (
                <>
                  <div className="space-y-2 relative group">
                    <Label className="text-[10px] font-bold text-emerald-400 uppercase">Optimized Meta Title</Label>
                    {isEditing ? (
                      <Input 
                        value={editedTitle} 
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="bg-muted/50 border-none h-9 text-xs"
                      />
                    ) : (
                      <p className="text-sm font-semibold pr-8 leading-tight">{editedTitle}</p>
                    )}
                    {!isEditing && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(editedTitle, "Meta Title")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 relative group">
                    <Label className="text-[10px] font-bold text-emerald-400 uppercase">Optimized Meta Description</Label>
                    {isEditing ? (
                      <Textarea 
                        value={editedDescription} 
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="bg-muted/50 border-none min-h-[100px] text-xs leading-relaxed"
                      />
                    ) : (
                      <p className="text-xs leading-relaxed pr-8">{editedDescription}</p>
                    )}
                    {!isEditing && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(editedDescription, "Meta Description")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2 h-full flex flex-col relative group">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold text-emerald-400 uppercase">Validated JSON-LD</Label>
                    {!isEditing && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleCopy(editedJsonLd, "JSON-LD Schema")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="flex-1 w-full rounded-lg bg-black/40 mt-1">
                    {isEditing ? (
                      <Textarea 
                        value={editedJsonLd} 
                        onChange={(e) => setEditedJsonLd(e.target.value)}
                        className="w-full h-[180px] bg-transparent border-none font-mono text-[10px] text-emerald-400/80 p-3"
                      />
                    ) : (
                      <pre className="p-3 font-mono text-[10px] text-emerald-400/80">
                        {editedJsonLd}
                      </pre>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl flex-1 font-bold uppercase text-[10px] tracking-widest">
            Discard
          </Button>
          <Button 
            disabled={confidence < 0.60}
            onClick={handlePublish} 
            className="bg-primary hover:bg-primary/90 text-white font-black gap-2 rounded-xl h-11 px-6 shadow-xl shadow-primary/20 flex-1 uppercase text-[10px] tracking-widest"
          >
            <Check className="w-4 h-4" /> Accept & Publish Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
