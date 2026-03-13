
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
  CalendarDays, 
  Plus, 
  Video, 
  Sparkles, 
  Loader2, 
  Clock, 
  Share2, 
  Trash2,
  Instagram,
  Facebook,
  Linkedin
} from "lucide-react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { scheduleSocialPostAction } from "@/app/actions/social-scheduler";
import { generateSocialPostsAction } from "@/app/actions/social-ai";
import { PageGuide } from "@/components/dashboard/page-guide";

export default function SocialCalendarPage() {
  const { user, profile, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isScheduling, setIsScheduling] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [videoDescription, setVideoDescription] = useState("");

  const organizationId = profile?.organizationId;

  const postsQuery = useMemoFirebase(() => {
    if (!db || !organizationId) return null;
    return query(
      collection(db, "organizations", organizationId, "social_posts"),
      orderBy("scheduledAt", "asc"),
      limit(50)
    );
  }, [db, organizationId]);

  const { data: posts, isLoading: postsLoading } = useCollection(postsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  const handleGenerateCaption = async () => {
    if (!organizationId || !user?.uid || !videoDescription) return;
    setIsGenerating(true);
    try {
      const result = await generateSocialPostsAction(organizationId, user.uid, {
        propertyTitle: "Video Update",
        city: "Local Market",
        description: videoDescription,
        keyFeatures: ["Market Insights", "New Listing", "Tour"]
      });
      if (result.success && result.data) {
        setCaption(result.data.instagram); 
        toast({ title: "SEO Caption Generated", description: "AI has optimized your post copy." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not generate caption." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !user?.uid || !date || !caption) return;

    setIsScheduling(true);
    const result = await scheduleSocialPostAction(organizationId, user.uid, {
      caption,
      mediaUrl: videoUrl || "https://agentpro.io/sample-video.mp4",
      mediaType: 'video',
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['instagram'],
      scheduledAt: date.toISOString(),
    });

    if (result.success) {
      toast({ title: "Post Scheduled", description: "Automated delivery active." });
      setIsDialogOpen(false);
      resetForm();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsScheduling(false);
  };

  const resetForm = () => {
    setVideoUrl("");
    setCaption("");
    setVideoDescription("");
    setSelectedPlatforms([]);
  };

  const handleDelete = (postId: string) => {
    if (!db || !organizationId) return;
    deleteDocumentNonBlocking(doc(db, "organizations", organizationId, "social_posts", postId));
    toast({ title: "Post Removed", description: "Schedule updated." });
  };

  if (isUserLoading || !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-black uppercase text-white">Social Content Calendar</h1>
              <p className="text-muted-foreground text-sm font-normal">Automate your video presence with SEO-optimized scheduling.</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="trigger" className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20">
                  <div className="relative">
                    <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-[11px]">Schedule New Post</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-none max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule Video Post</DialogTitle>
                  <DialogDescription>Upload your video and let AI handle the SEO optimization.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSchedule} className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Video Source</Label>
                        <div className="flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer group">
                          <div className="text-center">
                            <Video className="w-8 h-8 mx-auto text-primary group-hover:text-primary transition-colors mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload .mp4 or .mov</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Publishing Date</Label>
                        <div className="p-1 rounded-xl bg-muted/20 border border-white/5">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Describe Video (for AI)</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="e.g. Virtual tour of 123 Main St..." 
                            value={videoDescription}
                            onChange={(e) => setVideoDescription(e.target.value)}
                            className="bg-muted/50 border-none rounded-xl"
                          />
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="icon" 
                            onClick={handleGenerateCaption}
                            disabled={isGenerating || !videoDescription}
                            className="rounded-xl"
                          >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Sparkles className="w-4 h-4 text-primary" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Optimized Caption</Label>
                        <Textarea 
                          placeholder="Your post copy will appear here..." 
                          className="bg-muted/50 border-none min-h-[150px] rounded-xl"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Platforms</Label>
                        <div className="flex gap-2">
                          {['instagram', 'facebook', 'linkedin'].map(p => (
                            <Button
                              key={p}
                              type="button"
                              variant={selectedPlatforms.includes(p) ? 'default' : 'outline'}
                              size="sm"
                              className="capitalize gap-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest h-9"
                              onClick={() => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                            >
                              {p === 'instagram' && <Instagram className="w-3 h-3 text-[#E4405F]" />}
                              {p === 'facebook' && <Facebook className="w-3 h-3 text-[#1877F2]" />}
                              {p === 'linkedin' && <Linkedin className="w-3 h-3 text-[#0A66C2]" />}
                              {p}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isScheduling || !caption} variant="trigger" className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20">
                      <div className="relative">
                        <div className="bg-primary p-1.5 rounded-lg border border-white/10 flex items-center justify-center h-8 w-8 shadow-inner">
                          {isScheduling ? <Loader2 className="animate-spin text-white" /> : <Clock className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                      <span className="text-[11px]">Schedule Content</span>
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <PageGuide 
            description="Manage your social media delivery pipeline. Schedule video property tours and listing updates with AI-optimized captions."
            steps={[
              "Select a publishing date from the calendar",
              "Upload a property video or provide a source URL",
              "Use the 'Generate Caption' tool to let AI create platform-tuned copy",
              "Select target platforms and confirm the schedule"
            ]}
            tips={[
              "The 'Month View' allows you to see gaps in your content velocity.",
              "Posts update to 'Posted' status once delivered to integrated platforms."
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none shadow-xl lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-[10px] font-normal uppercase tracking-[0.2em] flex items-center gap-2 text-white">
                  <CalendarDays className="w-4 h-4 text-primary" /> Month View
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <div className="p-1 rounded-xl bg-muted/10 border border-white/5">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-normal uppercase tracking-widest">Scheduled Pipeline</CardTitle>
                  <CardDescription>Upcoming automated posts for your active accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
                  ) : posts && posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="flex items-start justify-between p-4 bg-muted/20 rounded-xl border border-white/5 group hover:bg-muted/30 transition-all">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-black rounded-lg overflow-hidden relative shrink-0">
                              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                                <Video className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold truncate max-w-[300px] text-white uppercase">{post.caption}</p>
                                <Badge variant="outline" className="text-[9px] uppercase font-black bg-primary/5 text-primary border-primary/20 tracking-widest">
                                  {post.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {new Date(post.scheduledAt).toLocaleString()}</span>
                                <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-primary" /> {post.platforms?.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-rose-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-4 border-2 border-dashed border-white/5 rounded-2xl opacity-40">
                      <Share2 className="w-12 h-12 mx-auto text-primary" />
                      <p className="text-sm font-black uppercase tracking-widest text-white">No content scheduled yet</p>
                      <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="rounded-xl uppercase font-black text-[9px] tracking-widest px-6 h-9">Plan Your First Video</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
