"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getCountryFlag, getCountryIso } from "@/lib/country-flags";

const FLAG_CDN_SIZES = {
  sm: { w: 24, h: 18, label: "24x18" },
  md: { w: 32, h: 24, label: "32x24" },
  lg: { w: 48, h: 36, label: "48x36" },
  xl: { w: 64, h: 48, label: "64x48" },
} as const;

type FlagSize = keyof typeof FLAG_CDN_SIZES;

interface CountryFlagProps {
  countryCode?: string | null;
  country?: string;
  size?: FlagSize;
  className?: string;
  showLabel?: boolean;
}

export function CountryFlag({
  countryCode,
  country,
  size = "md",
  className,
  showLabel = false,
}: CountryFlagProps) {
  const [imgFailed, setImgFailed] = useState(false);

  let iso = countryCode?.toUpperCase() ?? null;
  if (!iso && country) {
    iso = getCountryIso(country);
  }

  const emojiFlag = country ? getCountryFlag(country) : "🏳️";
  const { w, h, label } = FLAG_CDN_SIZES[size];
  const flagUrl = iso ? `/flags/${iso.toLowerCase()}.png` : null;
  const showImage = flagUrl && !imgFailed;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {showImage ? (
        <img
          src={flagUrl}
          alt={country ? `Flag of ${country}` : `Flag of ${iso}`}
          width={w}
          height={h}
          className="rounded-sm object-cover shadow-sm"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className="leading-none"
          style={{ fontSize: size === "xl" ? "1.75rem" : size === "lg" ? "1.25rem" : size === "md" ? "1rem" : "0.875rem" }}
        >
          {emojiFlag}
        </span>
      )}
      {showLabel && country && (
        <span className="text-sm font-medium">{country}</span>
      )}
    </span>
  );
}
