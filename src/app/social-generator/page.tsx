"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Hash, 
  Copy, 
  Check, 
  Loader2, 
  Zap, 
  Plus, 
  X,
  Share2
} from "lucide-react";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateSocialPostsAction } from "@/app/actions/social-ai";
import { SocialContentOutput } from "@/ai/flows/social-content-flow";
import { PageGuide } from "@/components/dashboard/page-guide";

export default function SocialGeneratorPage() {
  const { user, profile, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SocialContentOutput | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleAddFeature = () => setFeatures([...features, ""]);
  const handleRemoveFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
  const handleFeatureChange = (index: number, val: string) => {
    const newFeatures = [...features];
    newFeatures[index] = val;
    setFeatures(newFeatures);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organizationId || !user?.uid) return;

    setLoading(true);
    const response = await generateSocialPostsAction(profile.organizationId, user.uid, {
      propertyTitle: title,
      city,
      description,
      keyFeatures: features.filter(f => f.trim() !== ""),
    });

    if (response.success && response.data) {
      setResults(response.data);
      toast({ title: "Content Generated", description: "Your social posts are ready." });
    } else {
      toast({ variant: "destructive", title: "Generation Failed", description: response.error });
    }
    setLoading(false);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-body">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-black uppercase text-white">Social Content Generator</h1>
            <p className="text-muted-foreground text-sm font-normal">AI-powered listing copy optimized for every platform.</p>
          </div>

          <PageGuide 
            description="Multi-platform generator that converts listing details into professional social media copy including hashtags and emoji optimization."
            steps={[
              "Provide the property name and target city/neighborhood",
              "Paste the full listing description for AI context",
              "Define up to 5 key highlights (e.g., 'View', 'Kitchen')",
              "Click 'Generate' to create variants for Instagram, Facebook, and LinkedIn"
            ]}
            tips={[
              "Instagram captions are automatically bulleted for high readability.",
              "LinkedIn posts are tuned for investment value and market authority."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card border-none shadow-xl h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
                  <Zap className="w-5 h-5 text-primary" /> Listing Details
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Provide the property details to generate your posts.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Property Name</Label>
                      <Input 
                        placeholder="e.g. Modern Cliffside Villa" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-muted/50 border-none h-11 rounded-xl font-normal"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City / Neighborhood</Label>
                      <Input 
                        placeholder="e.g. Aspen, CO" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-muted/50 border-none h-11 rounded-xl font-normal"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Listing Description</Label>
                    <Textarea 
                      placeholder="Paste your listing details here..." 
                      className="bg-muted/50 border-none min-h-[120px] rounded-xl font-normal text-sm leading-relaxed"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key Highlights</Label>
                    <div className="space-y-2">
                      {features.map((feature, i) => (
                        <div key={i} className="flex gap-2">
                          <Input 
                            placeholder={`Feature ${i + 1}`} 
                            value={feature}
                            onChange={(e) => handleFeatureChange(i, e.target.value)}
                            className="bg-muted/50 border-none h-10 rounded-xl font-normal"
                          />
                          {features.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFeature(i)}>
                              <X className="w-4 h-4 text-white" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddFeature} className="w-full border-white/5 bg-white/5 hover:bg-white/10 rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest">
                        <Plus className="w-4 h-4 mr-2 text-primary" /> Add Highlight
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading} 
                    variant="trigger"
                    className="w-full h-14 rounded-2xl font-normal uppercase tracking-[0.15em] gap-3 shadow-xl"
                  >
                    <div className="relative">
                      <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <span className="text-[11px]">Generate All Platforms</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {!results ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                  <Share2 className="w-16 h-16 mb-4 text-primary" />
                  <p className="text-lg font-black uppercase tracking-widest">No content generated yet</p>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">Complete the form to create your platform-specific posts.</p>
                </div>
              ) : (
                <Tabs defaultValue="instagram" className="w-full">
                  <TabsList className="grid grid-cols-4 bg-muted/50 p-1 mb-4 rounded-xl border border-white/5 h-12">
                    <TabsTrigger value="instagram" className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest"><Instagram className="w-4 h-4 text-[#E4405F]" /> IG</TabsTrigger>
                    <TabsTrigger value="facebook" className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest"><Facebook className="w-4 h-4 text-[#1877F2]" /> FB</TabsTrigger>
                    <TabsTrigger value="linkedin" className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest"><Linkedin className="w-4 h-4 text-[#0A66C2]" /> LI</TabsTrigger>
                    <TabsTrigger value="hashtags" className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest"><Hash className="w-4 h-4 text-primary" /> Tags</TabsTrigger>
                  </TabsList>

                  <TabsContent value="instagram">
                    <PostPreview content={results.instagram} platform="Instagram" icon={<Instagram className="w-4 h-4 text-[#E4405F]" />} onCopy={() => handleCopy(results.instagram, 'ig')} isCopied={copiedKey === 'ig'} />
                  </TabsContent>
                  <TabsContent value="facebook">
                    <PostPreview content={results.facebook} platform="Facebook" icon={<Facebook className="w-4 h-4 text-[#1877F2]" />} onCopy={() => handleCopy(results.facebook, 'fb')} isCopied={copiedKey === 'fb'} />
                  </TabsContent>
                  <TabsContent value="linkedin">
                    <PostPreview content={results.linkedin} platform="LinkedIn" icon={<Linkedin className="w-4 h-4 text-[#0A66C2]" />} onCopy={() => handleCopy(results.linkedin, 'li')} isCopied={copiedKey === 'li'} />
                  </TabsContent>
                  <TabsContent value="hashtags">
                    <PostPreview content={results.hashtags} platform="Hashtags" icon={<Hash className="w-4 h-4 text-primary" />} onCopy={() => handleCopy(results.hashtags, 'tags')} isCopied={copiedKey === 'tags'} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function PostPreview({ content, platform, icon, onCopy, isCopied }: { content: string, platform: string, icon: React.ReactNode, onCopy: () => void, isCopied: boolean }) {
  return (
    <Card className="glass-card border-none shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-white/5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{platform} Optimization</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onCopy} className="gap-2 h-8 px-3 rounded-xl hover:bg-white/5 font-black uppercase text-[9px] tracking-widest">
            {isCopied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-white" />}
            {isCopied ? "Copied" : "Copy Post"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-normal">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
