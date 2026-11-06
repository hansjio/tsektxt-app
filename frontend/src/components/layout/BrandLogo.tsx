import Link from "next/link";
import { brand } from "@/config/brand";

export function BrandLogo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-lg">
      <span
        className="h-9 w-9 bg-ink"
        aria-hidden="true"
        style={{
          WebkitMask: "url(/main-logo.svg) center / contain no-repeat",
          mask: "url(/main-logo.svg) center / contain no-repeat",
        }}
      />
      {compact ? (
        <span className="sr-only">{brand.name}</span>
      ) : (
        <span className="flex items-center">
          <span className="block font-display text-2xl font-semibold leading-none tracking-[0.015em]">{brand.name}</span>
        </span>
      )}
    </Link>
  );
}
