"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { BeUIButton, beuiButtonBase, beuiButtonVariants, type BeUIButtonProps, type BeUIButtonVariant } from "@/components/beui/button";
import { cn } from "@/lib/utils";

type Variant = BeUIButtonVariant;

export function Button({
  className,
  variant = "primary",
  ...props
}: BeUIButtonProps & { variant?: Variant }) {
  return <BeUIButton className={className} variant={variant} {...props} />;
}

export function ButtonLink({
  className,
  variant = "primary",
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; children: ReactNode }) {
  return (
    <Link
      className={cn(
        beuiButtonBase,
        beuiButtonVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
