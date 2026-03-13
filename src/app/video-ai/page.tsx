"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Video, 
  Sparkles, 
  Loader2, 
  Download,
  Play,
  Film,
  Zap,
  Pause
} from "lucide-react";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { PageGuide } from "@/components/dashboard/page-guide";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VideoAiPage() {
  const { user, profile, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isGenerating) return;

    setIsGenerating(true);
    toast({ title: "Initializing AgentPro Engine", description: "Executing cinematic rendering (45-60s)." });

    try {
      // Simulate Veo 2.0 processing with Agent Pro branded delay
      await new Promise(r => setTimeout(r, 4000));
      // Using a cinematic nature / urban landscape sample
      setVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4");
      toast({ title: "Production Complete", description: "Your cinematic tour is ready for delivery." });
    } catch (err) {
      toast({ variant: "destructive", title: "Engine Error", description: "Resource limit reached. Retry in 60s." });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  if (isUserLoading || !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-body">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-black uppercase text-white">AI Video Station</h1>
            <p className="text-muted-foreground text-sm font-normal">Generate cinematic property tours and brand narratives using high-fidelity rendering.</p>
          </div>

          <PageGuide 
            description="Proprietary video engine that converts property descriptions into 5-8 second cinematic sequences optimized for high-conversion social ads."
            steps={[
              "Describe the property highlights and desired camera movement",
              "Select target aspect ratio (9:16 for Reels/Shorts)",
              "Execute the rendering command and monitor progress",
              "Preview the high-fidelity output and download for distribution"
            ]}
            tips={[
              "Mentioning 'Natural Light' or 'Twilight' significantly improves atmospheric quality.",
              "Use 'Smooth Drone Sweep' for the most impressive architectural reveals."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card border-none shadow-xl h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
                  <Film className="w-5 h-5 text-primary" /> Production Brief
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Define your cinematic parameters.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scene Description</Label>
                    <Textarea 
                      placeholder="e.g. Cinematic sweep of a modern luxury living room with floor-to-ceiling windows showing a sunset over the Pacific..." 
                      className="bg-muted/50 border-none min-h-[150px] rounded-xl text-sm leading-relaxed font-normal"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-muted/50 border-none h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:16">Vertical (9:16 Mobile)</SelectItem>
                        <SelectItem value="16:9">Horizontal (16:9 Web)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isGenerating} 
                    variant="trigger"
                    className="w-full h-14 rounded-2xl font-normal uppercase tracking-[0.15em] gap-3 shadow-xl"
                  >
                    <div className="relative">
                      <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Film className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <span className="text-[11px]">Generate Cinematic Content</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {!videoUrl && !isGenerating ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                  <Video className="w-16 h-16 mb-4" />
                  <p className="text-lg font-black uppercase tracking-widest">System Ready</p>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">Establish a brief to initiate production.</p>
                </div>
              ) : isGenerating ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-muted/20 rounded-3xl border border-white/5">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Zap className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <p className="text-lg font-black uppercase tracking-widest text-white">Rendering Matrix</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-2">AgentPro AI • Pixel Synthesis</p>
                </div>
              ) : (
                <Card className="glass-card border-none shadow-2xl overflow-hidden rounded-3xl">
                  <div className="relative aspect-[9/16] bg-black group cursor-pointer" onClick={togglePlay}>
                    {videoUrl && (
                      <video 
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        playsInline
                      />
                    )}
                    
                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl transition-transform group-hover:scale-110">
                          <Play className="w-8 h-8 text-white fill-current opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}

                    {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pause className="w-12 h-12 text-white opacity-50" />
                      </div>
                    )}

                    <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                      <Button className="flex-1 h-12 rounded-xl bg-white text-black font-black uppercase tracking-wider text-[11px] hover:bg-white/90 shadow-2xl">
                        <Download className="w-4 h-4 mr-2" /> Save High-Res MP4
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
