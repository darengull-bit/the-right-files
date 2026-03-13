"use client"

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  X, 
  Send, 
  User, 
  Loader2, 
  Minimize2, 
  Maximize2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { sendAssistantMessageAction } from "@/app/actions/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ChatAssistant() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const organizationId = profile?.organizationId;

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-seo-assistant', handleOpen);
    return () => window.removeEventListener('open-seo-assistant', handleOpen);
  }, []);

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "chat_messages"),
      orderBy("createdAt", "asc"),
      limit(50)
    );
  }, [db, organizationId]);

  const { data: messages } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !organizationId || !user?.uid || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    await sendAssistantMessageAction(
      organizationId,
      user.uid,
      userMessage,
      messages?.map(m => ({ role: m.role, content: m.content })) || []
    );
    
    setIsSending(false);
  };

  if (!user || pathname === '/') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-body">
      {isOpen && (
        <Card className={cn(
          "mb-4 w-[calc(100vw-2rem)] sm:w-[400px] glass-card border-none shadow-2xl transition-all duration-300 overflow-hidden flex flex-col",
          isMinimized ? "h-16" : "h-[500px] max-h-[80vh]"
        )}>
          <CardHeader className="p-4 bg-primary/10 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="bg-primary p-1 rounded-lg shadow-lg shadow-primary/30 h-[18px] w-[18px] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white fill-current" />
              </div>
              <CardTitle className="text-xs font-normal tracking-tight text-white uppercase flex items-center gap-1">
                <span className="font-[900]">AGENT</span><span className="font-[400] text-primary">PRO</span> <span className="opacity-60 ml-1">AI</span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <button 
                className="h-8 w-8 hover:bg-white/5 flex items-center justify-center rounded-lg transition-colors text-white" 
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button 
                className="h-8 w-8 hover:bg-rose-500/10 text-rose-400 flex items-center justify-center rounded-lg transition-colors" 
                onClick={() => setIsOpen(false)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-4">
                  <div className="flex gap-3 max-w-[90%]">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/10">
                      <Zap className="w-4 h-4 text-primary fill-current" />
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/40 border border-white/5 text-xs font-normal leading-relaxed text-white text-left">
                      Hello! I am your <span className="font-[900]">AGENT</span><span className="font-[400] text-primary">PRO</span> Intelligence Assistant. I can perform technical audits, optimize metadata, or analyze local search intent.
                    </div>
                  </div>

                  {messages?.map((m) => (
                    <div key={m.id} className={cn(
                      "flex gap-3 max-w-[90%] animate-in fade-in slide-in-from-bottom-2",
                      m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                        m.role === 'user' ? "bg-white/10 border-white/10" : "bg-primary/20 border-primary/10"
                      )}>
                        {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : (
                          <Zap className="w-4 h-4 text-primary fill-current" />
                        )}
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl text-xs leading-relaxed text-left",
                        m.role === 'user' 
                          ? "bg-primary text-white font-normal" 
                          : "bg-muted/40 border border-white/5 font-normal text-white"
                      )}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  
                  {isSending && (
                    <div className="flex gap-3 max-w-[90%] animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/40 border border-white/5 text-xs font-normal text-muted-foreground text-left">
                        Agent thinking...
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} className="h-4" />
                </div>
              </ScrollArea>

              <CardFooter className="p-4 bg-muted/20 border-t border-white/5 shrink-0">
                <form onSubmit={handleSend} className="flex w-full gap-2">
                  <Input 
                    placeholder="Ask Agent Pro AI..." 
                    className="bg-background border-white/10 text-xs h-10 rounded-xl focus:ring-primary/50 text-white font-normal text-left"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isSending}
                  />
                  <Button type="submit" size="icon" className="shrink-0 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={isSending || !input.trim()}>
                    <Send className="w-4 h-4 text-white" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}

      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="h-12 w-auto px-6 rounded-xl bg-black/80 hover:bg-black backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-white/10 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <Zap className="w-5 h-5 text-primary fill-current animate-pulse" />
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs italic tracking-tight uppercase leading-none flex items-center">
              <span className="text-white font-[900]">AGENT</span><span className="text-primary font-[400]">PRO</span>
            </span>
          </div>
        </Button>
      )}
    </div>
  );
}
