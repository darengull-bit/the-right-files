"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  Zap, 
  ArrowRight, 
  Search, 
  Loader2, 
  FileText, 
  TrendingUp, 
  Video, 
  Cpu, 
  MapPin,
  Sparkles,
  Plus,
  UserCircle
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { TEMPLATES, ContentTemplate } from "@/lib/template-data";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCustomTemplateAction } from "@/app/actions/templates";
import { useToast } from "@/hooks/use-toast";
import { PageGuide } from "@/components/dashboard/page-guide";

const IconMap: Record<string, any> = {
  Palace: Sparkles,
  TrendingUp: TrendingUp,
  Cpu: Cpu,
  Video: Video,
  MapPin: MapPin,
  Zap: Zap,
  Custom: UserCircle
};

export default function TemplateLibraryPage() {
  const { user, profile, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<any>("listing");
  const [newHint, setNewHint] = useState("");

  const organizationId = profile?.organizationId;

  const customTemplatesQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "custom_templates"),
      orderBy("createdAt", "desc")
    );
  }, [db, organizationId]);

  const { data: customTemplates, isLoading: customLoading } = useCollection(customTemplatesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !user?.uid) return;

    setIsAdding(true);
    const result = await createCustomTemplateAction(organizationId, user.uid, {
      name: newName,
      description: newDesc,
      category: newCategory,
      promptHint: newHint
    });

    if (result.success) {
      toast({ title: "Blueprint Saved", description: "Your custom framework is now in the library." });
      setIsDialogOpen(false);
      resetForm();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsAdding(false);
  };

  const resetForm = () => {
    setNewName("");
    setNewDesc("");
    setNewCategory("listing");
    setNewHint("");
  };

  const filteredSystem = TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustom = (customTemplates || []).filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTemplateCard = (template: any, isCustom = false) => {
    const Icon = IconMap[template.icon] || (isCustom ? UserCircle : FileText);
    
    return (
      <Card key={template.id} className="glass-card border-none overflow-hidden group hover:scale-[1.02] transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
            <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest ${isCustom ? 'border-primary/20 text-primary bg-primary/5' : 'opacity-50 text-white border-white/10'}`}>
              {isCustom ? "Custom" : template.category}
            </Badge>
          </div>
          <CardTitle className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">
            {template.name}
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed min-h-[32px]">
            {template.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-4 border-t border-white/5">
          <Button 
            onClick={() => {
              const url = template.category === 'social' ? '/social-generator' : '/content-generator';
              router.push(`${url}?blueprint=${template.id}&source=${isCustom ? 'custom' : 'system'}`);
            }}
            className="w-full h-10 rounded-xl bg-white/5 hover:bg-primary hover:text-white border border-white/10 group/btn transition-all font-bold text-xs uppercase tracking-widest"
          >
            Use Framework
            <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (isUserLoading || !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-black uppercase text-white">Blueprint Library</h1>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Strategic content frameworks designed for high-fidelity search dominance.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search blueprints..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-none rounded-2xl focus:ring-primary/50"
                />
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 font-bold gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5" /> Create New
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-none max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Define Custom Blueprint</DialogTitle>
                    <DialogDescription>Create a unique AI logic framework for your business content.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTemplate} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input placeholder="e.g. Waterfront Expert" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-muted/50 border-none" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newCategory} onValueChange={setNewCategory}>
                          <SelectTrigger className="bg-muted/50 border-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="listing">Listing Narrative</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="market">Market Report</SelectItem>
                            <SelectItem value="script">Video Script</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input placeholder="Briefly describe when to use this blueprint" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="bg-muted/50 border-none" required />
                    </div>
                    <div className="space-y-2">
                      <Label>AI Logic Hint (The prompt framework)</Label>
                      <Textarea 
                        placeholder="Tell the AI exactly how to write. e.g. Use a professional tone, focus on architectural details, and mention local walkability scores." 
                        value={newHint} 
                        onChange={(e) => setNewHint(e.target.value)}
                        className="bg-muted/50 border-none min-h-[120px]"
                        required 
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isAdding} className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90">
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Blueprint"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <PageGuide 
            description="The Blueprint Library contains specialized semantic frameworks that dictate how the AI engine generates content for different search intents."
            steps={[
              "Browse system frameworks for luxury, ROI, or SGE-first content",
              "Create custom blueprints to match your specific brand voice or niche",
              "Click 'Use Framework' to launch the relevant content generator with pre-loaded logic",
              "Manage your private blueprints in the 'My Blueprints' tab"
            ]}
            tips={[
              "SGE Answer-First is designed specifically to capture the Google AI Overview citation.",
              "Detailed prompt hints lead to 40% more accurate semantic relevance in local search."
            ]}
          />

          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="bg-white/5 p-1 border border-white/10 rounded-2xl">
              <TabsTrigger value="all" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest">All Blueprints</TabsTrigger>
              <TabsTrigger value="custom" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest gap-2">
                <UserCircle className="w-3 h-3" /> My Blueprints
              </TabsTrigger>
              <TabsTrigger value="listing" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest">Listings</TabsTrigger>
              <TabsTrigger value="social" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest">Social</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustom.map(t => renderTemplateCard(t, true))}
              {filteredSystem.map(t => renderTemplateCard(t))}
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              {customLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : filteredCustom.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCustom.map(t => renderTemplateCard(t, true))}
                </div>
              ) : (
                <div className="text-center p-20 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                  <UserCircle className="w-16 h-16 mx-auto mb-4 text-white" />
                  <p className="font-bold text-white">No custom blueprints defined</p>
                  <p className="text-sm">Create your own content frameworks to save time.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="listing" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSystem.filter(t => t.category === 'listing').map(t => renderTemplateCard(t))}
            </TabsContent>

            <TabsContent value="social" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSystem.filter(t => t.category === 'social').map(t => renderTemplateCard(t))}
            </TabsContent>
          </Tabs>

          <Card className="glass-card border-none shadow-xl bg-primary/5 border border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-lg shadow-primary/10">
                  <Zap className="w-5 h-5 text-black fill-current" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black uppercase text-white">Automated AI Frameworks</CardTitle>
                  <CardDescription className="text-xs">Advanced logic engines powered by Gemini 2.5 Flash.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Blueprints are dynamically updated based on search intent patterns. Custom blueprints are private to your organization.
                </p>
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                  <Zap className="w-3.5 h-3.5 text-primary fill-current" />
                  <span className="text-[10px] font-black uppercase text-primary">GSE Generator: Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
