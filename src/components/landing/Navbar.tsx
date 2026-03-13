"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, ChevronDown, Cpu, FileText, Video, Share2, LayoutGrid, CalendarDays, Clock, Rocket, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Landing Page Navbar
 * Weights: AGENT (900) / PRO (400)
 * Layout: Logo Far Left, Founder after Pricing.
 */

const features = [
  {
    title: "SEO Automation",
    description: "Autonomous technical audits and high-fidelity search optimizations.",
    icon: Cpu,
    href: "#",
  },
  {
    title: "Video / Photo Editor",
    description: "Cinematic property tours and professional HDR pixel enhancements.",
    icon: Video,
    href: "#",
  },
  {
    title: "Content Generation",
    description: "Semantic neighborhood articles and SEO-optimized listing narratives.",
    icon: FileText,
    href: "#",
  },
  {
    title: "Social Media Integration",
    description: "Seamless content delivery across all your business channels.",
    icon: Share2,
    href: "#",
  },
  {
    title: "Custom Template Library",
    description: "Private logic blueprints designed for your unique brand voice.",
    icon: LayoutGrid,
    href: "#",
  },
  {
    title: "Automation Scheduler",
    description: "High-frequency posting and automated market visibility sync.",
    icon: CalendarDays,
    href: "#",
  },
  {
    title: "Unfair Advantage",
    description: "Dominate local search results with elite search intelligence.",
    icon: Rocket,
    href: "#",
  },
  {
    title: "More Time and Money",
    description: "Reclaim agency hours and maximize your total marketing ROI.",
    icon: Clock,
    href: "#",
  },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [featuresOpen, setFeaturesOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Why AgentPro", href: "/#why-agentpro" },
    { name: "Authority", href: "/#authority" },
    { name: "Pricing", href: "/#pricing" },
    { name: "The Founder", href: "/founder" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-black/80 backdrop-blur-md border-white/10 py-3" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo - Far Left */}
          <Link href="/" className="flex items-center gap-0 group shrink-0">
            <span className="text-xl italic tracking-tighter uppercase leading-none">
              <span className="text-white font-[900]">AGENT</span><span className="text-primary font-[400]">PRO</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8 ml-4">
            <DropdownMenu open={featuresOpen} onOpenChange={setFeaturesOpen}>
              <DropdownMenuTrigger className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-primary transition-colors outline-none">
                Features <ChevronDown className="w-3.5 h-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-card border-white/10 w-[540px] p-2 mt-2">
                <div className="grid grid-cols-2 gap-1">
                  {features.map((f) => (
                    <DropdownMenuItem key={f.title} asChild>
                      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group cursor-default">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <f.icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black uppercase tracking-widest text-white">{f.title}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight font-medium">{f.description}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-white hover:text-primary hover:bg-transparent" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" className="h-10 px-6 rounded-xl border border-primary/20 bg-primary/5 text-white hover:bg-primary/10 font-black uppercase text-[11px] tracking-widest shadow-xl transition-all" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <div className="lg:hidden flex items-center justify-between gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/5">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black border-l border-white/10 p-0 w-80">
              <SheetHeader className="p-6 border-b border-white/5">
                <SheetTitle className="text-left font-black uppercase tracking-widest text-xs text-muted-foreground">Menu</SheetTitle>
              </SheetHeader>
              <div className="p-6 flex flex-col gap-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Core Features</p>
                  <div className="grid gap-4">
                    {features.map((f) => (
                      <div key={f.title} className="flex items-start gap-3 group">
                        <div className="p-2 rounded-lg bg-white/5 text-primary">
                          <f.icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black uppercase text-white">{f.title}</span>
                          <span className="text-[11px] text-muted-foreground leading-tight font-medium">{f.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Navigation</p>
                  <div className="grid gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="text-sm font-black uppercase text-white hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
                  <Button variant="outline" className="w-full h-12 rounded-xl border border-primary/20 bg-primary/5 text-white font-black uppercase text-xs tracking-widest" asChild>
                    <Link href="/signup">Free Trial</Link>
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 text-white font-black uppercase text-xs tracking-widest" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
