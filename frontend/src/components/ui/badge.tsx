"use client";

import { AnimatedBadge, type AnimatedBadgeProps } from "@/components/beui/badge";

export function Badge({ status = "neutral", size = "sm", ...props }: AnimatedBadgeProps) {
  return <AnimatedBadge status={status} size={size} {...props} />;
}
