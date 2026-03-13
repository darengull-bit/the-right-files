"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BookMarked, 
  Target, 
  Zap, 
  ShieldCheck,
  Loader2,
  ChevronRight,
  Database,
  Globe,
  Cpu,
  BarChart3
} from "lucide-react";
import { useUser } from "@/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PageGuide } from "@/components/dashboard/page-guide";

export default function PlaybookPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
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
            <div className="flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-black uppercase text-white">Strategy Playbook</h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium">The definitive guide to modern search visibility and brand authority.</p>
          </div>

          <PageGuide 
            description="The Strategy Playbook outlines the core methodology used by AgentPro to dominate Search Generative Experience (SGE) and traditional organic results."
            steps={[
              "Understand the transition from 'Keyword Density' to 'Entity Authority'",
              "Implement semantic content silos to prove topic authority",
              "Execute the GSE (Generative Search Engine Optimization) Loop",
              "Verify your brand footprint across external municipal and local data sources"
            ]}
            tips={[
              "Sentiment and citation velocity are the two most important secondary signals for AI search results.",
              "Use the 'LLM-Friendly' content model to ensure your data is cited correctly."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Card className="glass-card border-none shadow-2xl overflow-hidden rounded-3xl">
                <CardHeader className="bg-white border-b border-gray-100 py-8 px-12">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-primary" />
                      <CardTitle className="text-black font-normal uppercase tracking-tight">AI Dominance Framework</CardTitle>
                    </div>
                    <Badge className="bg-primary text-white font-black text-[10px] px-3">V2.5 MASTER</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[750px] w-full bg-white">
                    <div className="document-output">
                      <h1>Mastering the Generative Search Landscape</h1>
                      <p>Modern SEO is no longer just about keywords and backlinks. It is about becoming an established "entity" that LLMs (Large Language Models) trust and reference. This playbook outlines the core logic behind capturing citations in AI Overviews and SGE.</p>
                      
                      <h2>Concept 1: Entity-Based Authority</h2>
                      <p>AI models prioritize entities they can verify across multiple datasets. This isn't just about your website; it's about the web's collective consensus on your brand.</p>
                      <ul>
                        <li><strong>Logical Goal:</strong> Ensure your Name, Address, and Phone (NAP) are identical on every high-authority business registry.</li>
                        <li><strong>sameAs Property:</strong> Link your site to local municipal data and market reports to verify your geographic expertise via the Schema.org <code>sameAs</code> property.</li>
                      </ul>

                      <h2>Concept 2: Citation Velocity & Sentiment</h2>
                      <p>How often is your brand mentioned in a positive, authoritative context? AI models ingest this "velocity" to determine who to feature in recommendations.</p>
                      <p>You must move from "having a site" to "being a discussed brand." High-quality local news mentions and community event participation are now primary SEO signals.</p>

                      <h2>Concept 3: LLM-Friendly Content Architecture</h2>
                      <p>AI agents don't read like humans; they tokenize and ingest. To be cited, your content must be structurally undeniable.</p>
                      <ol>
                        <li><strong>Direct Answer Model (DAM):</strong> Place a 40-word concise answer to a common query directly under a primary header.</li>
                        <li><strong>Structured Data Interoperability:</strong> Use JSON-LD to tell the bot exactly what your data represents (Price, Location, Rating).</li>
                        <li><strong>Semantic Siloing:</strong> Group related content in tight thematic silos to prove "Topic Authority."</li>
                      </ol>

                      <h2>Concept 4: The GSE (Generative Search Engine Optimization) Loop</h2>
                      <p>Dominance requires a continuous loop of Audit, Optimize, and Verify.</p>
                      <p>1. <strong>Crawl:</strong> Detect how models currently summarize your page.<br />
                      2. <strong>Pivot:</strong> Adjust tone and structure to match "Best Answer" patterns.<br />
                      3. <strong>Inject:</strong> Push technical schema to remove ambiguity for the bot.</p>

                      <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                        <p className="font-bold text-blue-900 mb-2">The Golden Rule:</p>
                        <p className="text-blue-800 font-medium">"If a machine can't categorize your expertise in 50ms, a human will never find you in an AI search result."</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xs font-normal flex items-center gap-2 uppercase tracking-widest text-white">
                    <Target className="w-4 h-4 text-primary" /> Strategic Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-white uppercase mb-1">Citation Share</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Aim for appearing in 20% of relevant AI search snippets.</p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-white uppercase mb-1">Entity Verification</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Complete 100% of Knowledge Graph entity links.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xs font-normal uppercase tracking-widest text-muted-foreground">Quick Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => router.push('/seo-analysis')}>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase text-white">Entity Audit</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => router.push('/content-generator')}>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase text-white">GSE Generator</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Logic Verified</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  "The concepts in this playbook are aligned with the latest LLM ingestion patterns used by Google, Perplexity, and OpenAI."
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
