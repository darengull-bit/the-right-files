
"use client"

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Zap, 
  Plus, 
  X,
  Target,
  BookOpen,
  LayoutGrid
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { generateBlogPostAction } from "@/app/actions/blog-posts";
import { BlogPostOutput } from "@/ai/flows/blog-post-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TEMPLATES } from "@/lib/template-data";
import { PageGuide } from "@/components/dashboard/page-guide";

function ContentGeneratorContent() {
  const { user, profile, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BlogPostOutput | null>(null);
  const [copied, setCopied] = useState(false);

  const [topic, setTopic] = useState("");
  const [city, setCity] = useState("");
  const [audience, setAudience] = useState<"buyers" | "sellers" | "investors">("buyers");
  const [keywords, setKeywords] = useState<string[]>([""]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("none");

  const organizationId = profile?.organizationId;

  const customTemplatesQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return collection(db, "organizations", organizationId, "custom_templates");
  }, [db, organizationId]);

  const { data: customTemplates } = useCollection(customTemplatesQuery);

  useEffect(() => {
    const bpId = searchParams.get('blueprint');
    if (bpId) setSelectedBlueprintId(bpId);
  }, [searchParams]);

  const allBlueprints = useMemo(() => {
    const custom = (customTemplates || []).map(t => ({ ...t, source: 'custom' }));
    const system = TEMPLATES.map(t => ({ ...t, source: 'system' }));
    return [...custom, ...system];
  }, [customTemplates]);

  const activeBlueprint = useMemo(() => {
    return allBlueprints.find(b => b.id === selectedBlueprintId);
  }, [selectedBlueprintId, allBlueprints]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleAddKeyword = () => setKeywords([...keywords, ""]);
  const handleRemoveKeyword = (index: number) => setKeywords(keywords.filter((_, i) => i !== index));
  const handleKeywordChange = (index: number, val: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = val;
    setKeywords(newKeywords);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organizationId || !user?.uid) return;

    setLoading(true);
    const response = await generateBlogPostAction(profile.organizationId, user.uid, {
      topic,
      city,
      targetAudience: audience,
      keywords: keywords.filter(k => k.trim() !== ""),
      styleHint: activeBlueprint?.promptHint || undefined
    });

    if (response.success && response.data) {
      setResult(response.data);
      toast({ title: "Content Ready", description: "Your SEO article has been generated." });
    } else {
      toast({ variant: "destructive", title: "Generation Failed", description: response.error });
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-body">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-black uppercase text-white">SEO Content Creator</h1>
            <p className="text-muted-foreground text-sm font-normal">Generate high-fidelity articles optimized for your neighborhood market.</p>
          </div>

          <PageGuide 
            description="High-fidelity AI content engine that generates localized real estate articles optimized for semantic search dominance."
            steps={[
              "Select a content framework from the Blueprint selector",
              "Enter your core topic and target city for local intent",
              "Add up to 5 secondary keywords to improve semantic coverage",
              "Click 'Generate' and review the result in the high-fidelity Document Engine"
            ]}
            tips={[
              "Custom blueprints in the Library can be selected here to apply your unique brand voice.",
              "Markdown formatting is automatically applied for easy deployment to your CMS."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <Card className="glass-card border-none shadow-xl h-fit lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
                  <Zap className="w-5 h-5 text-primary fill-current" /> Article Brief
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Define topic and SEO intent.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Select Blueprint
                    </Label>
                    <Select value={selectedBlueprintId} onValueChange={setSelectedBlueprintId}>
                      <SelectTrigger className="bg-muted/50 border-none h-11 rounded-xl">
                        <SelectValue placeholder="General Content (Default)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">General Content (Default)</SelectItem>
                        {allBlueprints.map(bp => (
                          <SelectItem key={bp.id} value={bp.id}>
                            {bp.name} {bp.source === 'custom' ? '(My Blueprint)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Article Topic</Label>
                    <Input 
                      placeholder="e.g. Why Victoria is great for buyers" 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-muted/50 border-none h-11 rounded-xl font-normal"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target City</Label>
                      <Input 
                        placeholder="e.g. Victoria, BC" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-muted/50 border-none h-11 rounded-xl font-normal"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audience</Label>
                      <Select value={audience} onValueChange={(v: any) => setAudience(v)}>
                        <SelectTrigger className="bg-muted/50 border-none h-11">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyers">Home Buyers</SelectItem>
                          <SelectItem value="sellers">Home Sellers</SelectItem>
                          <SelectItem value="investors">Investors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Keywords</Label>
                    <div className="space-y-2">
                      {keywords.map((kw, i) => (
                        <div key={i} className="flex gap-2">
                          <Input 
                            placeholder={`Keyword ${i + 1}`} 
                            value={kw}
                            onChange={(e) => handleKeywordChange(i, e.target.value)}
                            className="bg-muted/50 border-none h-10 rounded-xl font-normal"
                          />
                          {keywords.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveKeyword(i)}>
                              <X className="w-4 h-4 text-white" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddKeyword} className="w-full border-white/5 bg-white/5 hover:bg-white/10 rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest">
                        <Plus className="w-4 h-4 mr-2" /> Add Keyword
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
                    <span className="text-[11px]">Generate Article</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-3 space-y-6">
              {!result ? (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                  <BookOpen className="w-16 h-16 mb-4" />
                  <p className="text-lg font-black uppercase tracking-widest">Ready to write</p>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">Complete the brief to generate your SEO document.</p>
                </div>
              ) : (
                <div className="space-y-6 h-full flex flex-col">
                  <div className="flex items-center justify-between bg-muted/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Document Preview</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 h-9 px-4 rounded-xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px]">
                      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy to Clipboard"}
                    </Button>
                  </div>
                  
                  <Card className="flex-1 bg-white border-none shadow-2xl overflow-hidden rounded-2xl">
                    <ScrollArea className="h-[700px] w-full">
                      <div className="document-output">
                        <h1>{result.title}</h1>
                        <p className="italic text-gray-500 mb-8">{result.excerpt}</p>
                        <div className="whitespace-pre-wrap">
                          {result.content}
                        </div>
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ContentGeneratorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ContentGeneratorContent />
    </Suspense>
  );
}
