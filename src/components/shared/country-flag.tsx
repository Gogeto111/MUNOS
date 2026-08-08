"use client";

import { getCountryFlag } from "@/lib/country-flags";
import { cn } from "@/lib/utils";

export function CountryFlag({
  country,
  mode = "compact",
  className,
}: {
  country: string;
  mode?: "compact" | "full";
  className?: string;
}) {
  const flag = getCountryFlag(country);

  if (mode === "full") {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        <span className="text-lg leading-none">{flag}</span>
        <span className="text-sm font-medium">{country}</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="text-base leading-none">{flag}</span>
      <span className="text-xs font-medium text-muted-foreground">{country}</span>
    </span>
  );
}
