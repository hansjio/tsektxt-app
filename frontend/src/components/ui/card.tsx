import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[1.5rem] border border-white/70 bg-white/78 shadow-sm backdrop-blur-xl", className)} {...props} />;
}
