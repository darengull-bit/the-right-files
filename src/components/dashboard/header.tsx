"use client"

import { Search, Loader2, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser } from "@/firebase";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NavContent } from "./sidebar-nav";

/**
 * @fileOverview Dashboard Header.
 * Logo removed as it is redundant with the sidebar branding.
 */

export function Header() {
  const { isUserLoading } = useUser();

  return (
    <header className="h-16 border-b border-white/5 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        {/* Mobile Nav Trigger */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/5 rounded-xl">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r border-white/5">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center max-w-sm w-full relative">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Command search..." 
            className="pl-10 bg-white/5 border-none h-10 w-full rounded-xl focus:ring-primary/50 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 justify-end">
        {isUserLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>
    </header>
  );
}
