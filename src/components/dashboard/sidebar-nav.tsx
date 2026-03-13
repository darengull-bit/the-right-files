
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Key, 
  Map, 
  BarChart3, 
  Settings, 
  MapPin, 
  Terminal, 
  Zap, 
  Share2, 
  Sparkles,
  FileText,
  CalendarDays,
  Search,
  CreditCard,
  Cpu,
  BookMarked,
  LayoutGrid,
  Video,
  ImageIcon,
  ShieldCheck,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const navItems = [
  { name: "Command Centre", href: "/dashboard", icon: LayoutDashboard },
  { name: "Optimization Audit", href: "/seo-analysis", icon: Search },
  { name: "Keyword Tracking", href: "/keywords", icon: Key },
  { name: "Google Integrations", href: "/google-integrations", icon: Globe },
  { name: "AI Search Protocol", href: "/google-ai-optimization", icon: Cpu },
  { name: "Heat Map Control", href: "/map-pack", icon: Map },
  { name: "Strategy Playbook", href: "/playbook", icon: BookMarked },
  { name: "Blueprint Library", href: "/templates", icon: LayoutGrid },
  { name: "Content Creator", href: "/content-generator", icon: FileText },
  { name: "AI Photo Editor", href: "/photo-ai", icon: ImageIcon },
  { name: "AI Video Editor", href: "/video-ai", icon: Video },
  { name: "Social Connect", href: "/social-accounts", icon: Share2 },
  { name: "Social Content", href: "/social-generator", icon: Sparkles },
  { name: "Post Calendar", href: "/social-calendar", icon: CalendarDays },
  { name: "Performance", href: "/performance", icon: BarChart3 },
];

export const businessItems = [
  { name: "Workspaces", href: "/workspaces", icon: MapPin },
  { name: "Access Management", href: "/api-keys", icon: Terminal },
  { name: "Live Data Sync", href: "/webhooks", icon: Zap },
  { name: "Authority Network", href: "/authority-network", icon: ShieldCheck },
];

export const accountItems = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Billing & Plans", href: "/settings", icon: CreditCard },
];

export function NavContent() {
  const pathname = usePathname();
  const { profile, organization } = useUser();

  const renderLinks = (items: typeof navItems) => (
    items.map((item) => (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-normal transition-all group",
          pathname === item.href ? "bg-primary text-white" : "text-white/80 hover:bg-white/5"
        )}
      >
        <item.icon className={cn("w-4 h-4 text-primary transition-colors")} />
        {item.name}
      </Link>
    ))
  );

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="px-4 py-8 border-b border-white/5 bg-primary/5">
        <div className="flex flex-col items-center text-center">
          <Link href="/dashboard" className="flex flex-col items-center gap-0 mb-4 group">
            <span className="text-xl italic tracking-tighter uppercase leading-none">
              <span className="text-white font-[900]">AGENT</span><span className="text-primary font-[400]">PRO</span>
            </span>
            <span className="text-[9px] font-normal text-white/60 uppercase tracking-[0.3em] mt-2">
              Domination HQ
            </span>
          </Link>
          
          <div className="flex flex-col gap-1.5 p-3 bg-black/40 rounded-xl border border-white/5 w-full">
            <p className="text-[11px] font-normal text-white truncate uppercase tracking-tight">
              {profile?.name || "Agent Name"}
            </p>
            <Badge variant="outline" className="text-[8px] h-4 py-0 w-fit font-normal bg-primary/10 text-primary border-primary/20 uppercase tracking-widest mx-auto">
              {(organization?.plan || profile?.plan || "Starter").toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted-foreground/50">Navigation</span>
            {renderLinks(navItems)}
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-1">
            <span className="px-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted-foreground/50">Business</span>
            {renderLinks(businessItems)}
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-1">
            <span className="px-3 text-[10px] font-normal uppercase tracking-[0.2em] text-muted-foreground/50">Account</span>
            {renderLinks(accountItems)}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export function SidebarNav() {
  return (
    <div className="hidden lg:flex h-full w-64 flex-col border-r border-white/5 shrink-0 transition-all">
      <NavContent />
    </div>
  );
}
