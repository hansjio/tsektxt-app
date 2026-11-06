"use client";

import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ButtonLink } from "@/components/ui/button";
import { marketingNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      const scrollingUp = currentY < lastY.current;
      const nearTop = currentY < 48;

      setVisible(nearTop || scrollingUp);
      lastY.current = currentY;
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-40 px-3 py-3 transition-transform duration-300", visible ? "translate-y-0" : "-translate-y-full")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-5">
        <BrandLogo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex" aria-label="Main navigation">
          {marketingNavigation.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ButtonLink href="/dashboard" variant="ghost" className="min-h-9 px-3 text-xs sm:min-h-11 sm:px-5 sm:text-sm">
            Dashboard
          </ButtonLink>
          <ButtonLink href="/checker" className="min-h-9 px-3 text-xs sm:min-h-11 sm:px-5 sm:text-sm">
            <span className="sm:hidden">Checker</span>
            <span className="hidden sm:inline">Open checker</span>
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
