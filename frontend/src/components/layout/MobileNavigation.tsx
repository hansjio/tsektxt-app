"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/beui/drawer";
import { AccountSettingsLink, DashboardNavLinks } from "@/components/layout/AppSidebar";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function handleDashboardDrawerOpen(event: Event) {
      const detail = (event as CustomEvent<{ drawer: string }>).detail;
      if (detail?.drawer !== "sidebar") setOpen(false);
    }
    window.addEventListener("tsek:dashboard-drawer-open", handleDashboardDrawerOpen);
    return () => window.removeEventListener("tsek:dashboard-drawer-open", handleDashboardDrawerOpen);
  }, []);

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      window.dispatchEvent(new CustomEvent("tsek:dashboard-drawer-open", { detail: { drawer: "sidebar" } }));
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 px-3 py-2 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
        <Drawer open={open} onOpenChange={updateOpen}>
          <DrawerTrigger asChild>
            <Button variant="secondary" aria-label="Open menu" className="min-h-11 w-11 px-0">
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent side="left" size="clamp(17rem,70vw,22rem)" className="z-[90]">
            <DrawerHeader className="flex items-center justify-between gap-3 border-b-0 pb-2">
              <DrawerTitle className="sr-only">Navigation</DrawerTitle>
              <DrawerDescription className="sr-only">Dashboard navigation</DrawerDescription>
              <BrandLogo href="/dashboard" />
              <DrawerClose
                aria-label="Close menu"
                className="border border-white/70 bg-white/70 shadow-sm backdrop-blur hover:bg-white"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </DrawerClose>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto py-4">
              <DashboardNavLinks pathname={pathname} onNavigate={() => updateOpen(false)} className="mt-4" />
            </div>
            <AccountSettingsLink pathname={pathname} onNavigate={() => updateOpen(false)} className="mt-4" />
          </DrawerContent>
        </Drawer>
        <div className="flex min-w-0 justify-center">
          <BrandLogo href="/dashboard" />
        </div>
        <span aria-hidden="true" />
      </div>
    </header>
  );
}
