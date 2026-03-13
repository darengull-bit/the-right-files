"use client"

import { useState } from "react"
import { HelpCircle, ChevronDown, ChevronUp, Info, BookOpen, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent } from "@/components/ui/card"

interface PageGuideProps {
  description: string
  steps: string[]
  tips?: string[]
}

export function PageGuide({ description, steps, tips }: PageGuideProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center mb-2">
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest h-8 px-4"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {isOpen ? "Close Guide" : "How to Use"}
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
        <Card className="glass-card border-none overflow-hidden bg-primary/5 border border-primary/20 mb-6">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest">
                <Info className="w-3.5 h-3.5" /> Information
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest">
                <BookOpen className="w-3.5 h-3.5" /> Instructions
              </div>
              <ul className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="text-xs text-white/80 flex gap-2">
                    <span className="text-primary font-black">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            {tips && tips.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest">
                  <Lightbulb className="w-3.5 h-3.5" /> Pro Tips
                </div>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground italic leading-relaxed">
                      " {tip} "
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
