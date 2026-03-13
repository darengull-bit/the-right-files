"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  Download,
  Upload,
  Zap,
  CheckCircle2,
  Maximize
} from "lucide-react";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { PageGuide } from "@/components/dashboard/page-guide";
import Image from "next/image";

export default function PhotoAiPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState("hdr");

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  const presets = [
    { id: 'hdr', name: 'HDR Balance', desc: 'Even out shadows and highlights.' },
    { id: 'sky', name: 'Blue Sky', desc: 'Replace grey skies with perfect weather.' },
    { id: 'twilight', name: 'Twilight', desc: 'Convert daytime shots to evening luxury.' },
    { id: 'declutter', name: 'Object Removal', desc: 'Clean up distracting items.' },
  ];

  const handleEnhance = async () => {
    setIsEnhancing(true);
    // Simulate Gemini Flash Image processing
    await new Promise(r => setTimeout(r, 3000));
    setResultImage("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop");
    setIsEnhancing(false);
    toast({ title: "Enhancement Complete", description: "Professional filters applied successfully." });
  };

  if (isUserLoading || !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-body">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-black uppercase text-white">AI Photo Editor</h1>
            <p className="text-muted-foreground text-sm font-normal">Professional real estate photo processing powered by Gemini AI.</p>
          </div>

          <PageGuide 
            description="One-click AI photo processing workstation designed specifically for property photography optimization."
            steps={[
              "Upload a raw property photo (.jpg or .png)",
              "Select a specialized real estate preset (e.g., HDR, Twilight)",
              "Click 'Optimize Photo' to process using Gemini Vision",
              "Review the side-by-side comparison and download the high-res result"
            ]}
            tips={[
              "HDR Balance is best for interior shots with bright windows.",
              "Twilight Conversion significantly increases click-through-rate on luxury listings."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="glass-card border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Select Enhancement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {presets.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedPreset(p.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedPreset === p.id 
                          ? 'bg-primary/10 border-primary border-2' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <p className="font-black text-xs uppercase text-white mb-1">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-normal">{p.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button 
                onClick={handleEnhance} 
                disabled={isEnhancing} 
                variant="trigger"
                className="w-full h-14 rounded-2xl font-normal uppercase tracking-[0.15em] gap-3 shadow-xl"
              >
                <div className="relative">
                  <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                    {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ImageIcon className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <span className="text-[11px]">Optimize Photo</span>
              </Button>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {!resultImage && !isEnhancing ? (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-all">
                  <Upload className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-black uppercase tracking-widest opacity-40">Upload Property Photo</p>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-20 mt-2">Supports JPG, PNG up to 10MB</p>
                </div>
              ) : isEnhancing ? (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-muted/20 rounded-3xl border border-white/5">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest text-white">Analyzing Pixel Metadata...</p>
                </div>
              ) : (
                <Card className="glass-card border-none shadow-2xl overflow-hidden rounded-3xl">
                  <div className="relative aspect-video">
                    <Image 
                      src={resultImage} 
                      alt="Enhanced Property" 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-primary text-white font-black px-3 py-1">ENHANCED</Badge>
                    </div>
                    <div className="absolute bottom-6 right-6 flex gap-3">
                      <Button variant="secondary" size="icon" className="rounded-xl h-12 w-12 bg-black/60 backdrop-blur-md border-none text-white">
                        <Maximize className="w-5 h-5" />
                      </Button>
                      <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs">
                        <Download className="w-4 h-4 mr-2" /> Save Photo
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
