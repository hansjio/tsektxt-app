"use client";

import { MoreHorizontal, PanelLeftClose, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { appNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-border/70 bg-white p-4 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block", collapsed ? "w-20" : "w-56")}>
      <div className="flex h-full flex-col">
        <div className={cn("flex items-start gap-2", collapsed ? "justify-center" : "justify-between")}>
          {collapsed ? (
            <button
              type="button"
              aria-label="Expand sidebar"
              className="grid h-10 w-10 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              onClick={() => setCollapsed(false)}
            >
              <span
                className="block h-7 w-7 bg-ink"
                aria-hidden="true"
                style={{
                  WebkitMask: "url(/main-logo.svg) center / contain no-repeat",
                  mask: "url(/main-logo.svg) center / contain no-repeat",
                }}
              />
              <span className="sr-only">{brand.name}</span>
            </button>
          ) : (
            <>
              <BrandLogo href="/dashboard" />
              <Button
                variant="ghost"
                aria-label="Collapse sidebar"
                className="min-h-10 px-3 transition-colors duration-300 ease-out hover:bg-canvas"
                onClick={() => setCollapsed(true)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <DashboardNavLinks pathname={pathname} collapsed={collapsed} className="mt-8" />
        <AccountSettingsLink pathname={pathname} collapsed={collapsed} className="mt-auto" />
      </div>
    </aside>
  );
}

export function DashboardNavLinks({
  pathname,
  collapsed = false,
  onNavigate,
  className,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-1", className)} aria-label="Dashboard navigation">
      {appNavigation.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center overflow-hidden rounded-full text-sm font-medium text-muted transition-colors duration-200 ease-out hover:bg-canvas hover:text-ink",
              collapsed ? "mx-auto w-10 justify-center px-0" : "gap-3 px-3",
              active && "bg-ink text-white shadow-sm hover:bg-ink hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={cn("whitespace-nowrap transition-[opacity,transform,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", collapsed ? "w-0 translate-x-3 opacity-0" : "w-auto translate-x-0 opacity-100")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AccountSettingsLink({
  pathname,
  collapsed = false,
  onNavigate,
  className,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Link
        href="/dashboard/settings"
        title={collapsed ? "Settings" : undefined}
        onClick={onNavigate}
        aria-current={pathname === "/dashboard/settings" ? "page" : undefined}
        className={cn(
          "flex min-h-10 items-center overflow-hidden rounded-full text-sm font-medium text-muted transition-colors duration-200 ease-out hover:bg-canvas hover:text-ink",
          collapsed ? "mx-auto w-10 justify-center px-0" : "gap-3 px-3",
          pathname === "/dashboard/settings" && "bg-ink text-white shadow-sm hover:bg-ink hover:text-white",
        )}
      >
        <UserCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className={cn("whitespace-nowrap transition-[opacity,transform,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", collapsed ? "w-0 translate-x-3 opacity-0" : "min-w-0 flex-1 w-auto translate-x-0 opacity-100")}>
          Settings
        </span>
        {!collapsed ? <MoreHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      </Link>
    </div>
  );
}
