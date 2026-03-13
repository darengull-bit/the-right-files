"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Cpu, 
  CheckCircle2, 
  BookOpen, 
  Zap, 
  Target, 
  ShieldCheck,
  ArrowRight,
  Info,
  Loader2,
  Globe
} from "lucide-react";
import { useUser } from "@/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PageGuide } from "@/components/dashboard/page-guide";

export default function GoogleAiOptimizationPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="h-screen items-center justify-center flex bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-3xl font-black uppercase text-white">AI Search Result Protocol</h1>
            <p className="text-muted-foreground text-sm font-medium">Strategic framework for dominating Google AI Overviews and SGE.</p>
          </div>

          <PageGuide 
            description="The AI Search Protocol ensures your business content is formatted correctly for machine ingestion by Large Language Models (LLMs) and Search Generative Experience (SGE)."
            steps={[
              "Optimize for Entity Authority via Knowledge Graph links",
              "Implement semantic context using NLP-optimized headers",
              "Inject aggressive JSON-LD schema for data paths",
              "Cite local authority sources to verify E-E-A-T signals"
            ]}
            tips={[
              "LLMs prioritize content that provides a direct answer in the first 40 words.",
              "Use 'SGE-First' blueprints in the Library to automate this structure."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-normal uppercase flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary fill-current" /> Core Optimization Protocol
                    </CardTitle>
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary font-black uppercase tracking-widest text-[8px]">V1.5 LIVE</Badge>
                  </div>
                  <CardDescription className="font-bold">Follow these four pillars to rank in AI-generated responses.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest">Entity Authority</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Establish your business as a verified entity in the Knowledge Graph. Use consistent NAP and aggressive <code className="text-primary">sameAs</code> schema properties.
                    </p>
                  </div>
                  <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest">Semantic Context</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Shift from keywords to concepts. Use Natural Language Processing (NLP) optimized headers that provide "Direct Answers."
                    </p>
                  </div>
                  <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest">Structured Data</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Implement aggressive JSON-LD. Go beyond basic business schema; use FAQPage and RealEstateListing for explicit data paths.
                    </p>
                  </div>
                  <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest">E-E-A-T Signals</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Experience, Expertise, Authoritativeness, and Trust. Cite local neighborhood data and official reports to verify domain expertise.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-2xl overflow-hidden rounded-3xl">
                <CardHeader className="bg-white border-b border-gray-100 py-8 px-12">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <CardTitle className="text-black font-normal uppercase tracking-tight">AI Optimization: How-To Guide</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px] w-full bg-white">
                    <div className="document-output">
                      <h1>Mastering Google AI Overviews</h1>
                      <p>As Google shifts toward a Search Generative Experience (SGE), your website must be formatted for machine readability as much as human consumption. This guide outlines the exact steps to ensure your listings and neighborhood pages are cited by the Google AI model.</p>
                      
                      <h2>Step 1: The Answer-First Content Model</h2>
                      <p>Google's AI prioritizes content that provides immediate, factual answers to user queries. To capture these slots:</p>
                      <ul>
                        <li>Place a direct answer (2-3 sentences) immediately below your H1 or H2 headers.</li>
                        <li>Use bold text for key facts (prices, statistics, city names).</li>
                        <li>Format data in lists or tables; AI agents ingest structured lists 40% more effectively than prose.</li>
                      </ul>

                      <h2>Step 2: Technical Schema Injection</h2>
                      <p>AI models use schema as a "source of truth." Without it, the model must guess your context. Ensure your site includes:</p>
                      <ol>
                        <li><strong>RealEstateListing:</strong> For specific properties, including priceCurrency and address.</li>
                        <li><strong>LocalBusiness:</strong> Explicitly defining your service area using the <code>areaServed</code> property.</li>
                        <li><strong>Knowledge Graph Linking:</strong> Using <code>sameAs</code> to link your site to high-authority nodes like official state registries or professional associations.</li>
                      </ol>

                      <h2>Step 3: High-Fidelity Multimedia Citations</h2>
                      <p>AI Overviews often include image carousels. To be featured:</p>
                      <ul>
                        <li>Ensure every image has a descriptive, keyword-rich ALT tag.</li>
                        <li>Use high-resolution 16:9 images (Google's preferred SGE aspect ratio).</li>
                        <li>Host a "Neighborhood Tour" video and include <code>VideoObject</code> schema.</li>
                      </ul>

                      <div className="mt-8 p-6 bg-blue-50 border-l-4 border-primary rounded-r-xl">
                        <p className="font-bold text-primary mb-2">Pro Tip:</p>
                        <p className="text-primary italic">"The AI isn't looking for the most keywords; it's looking for the most reliable answer to the user's specific intent."</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="glass-card border-none shadow-xl bg-white/5 border border-white/20">
                <CardHeader>
                  <CardTitle className="text-xs font-normal flex items-center gap-2 uppercase tracking-[0.2em] text-white">
                    <Info className="w-4 h-4 text-primary" /> Why this matters
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] text-white/60 font-medium leading-relaxed">
                  Google AI Overviews occupy the top 50% of the screen on mobile. If you aren't optimized for the AI, you are essentially invisible to mobile searchers, regardless of your organic rank.
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xs font-normal flex items-center gap-2 uppercase tracking-[0.2em] text-white">
                    <Target className="w-4 h-4 text-primary" /> Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 group cursor-pointer" onClick={() => router.push('/seo-analysis')}>
                    <div className="mt-1 p-1.5 bg-white/10 rounded-lg group-hover:bg-primary transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-white group-hover:text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">Run AI Gap Analysis</p>
                  </div>
                  <div className="flex items-start gap-3 group cursor-pointer" onClick={() => router.push('/content-generator')}>
                    <div className="mt-1 p-1.5 bg-white/10 rounded-lg group-hover:bg-primary transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-white group-hover:text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">Generate SGE Content</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xs font-normal uppercase tracking-widest text-muted-foreground">Status Monitor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">SGE INDEXING</span>
                    <Badge variant="outline" className="text-[8px] border-white/20 text-white font-black uppercase tracking-widest">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">ENTITY VERIFIED</span>
                    <Badge variant="outline" className="text-[8px] border-primary/20 text-primary font-black uppercase tracking-widest">CONNECTED</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
