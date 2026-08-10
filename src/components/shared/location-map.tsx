"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationMapProps {
  lat: number;
  lon: number;
  zoom?: number;
  className?: string;
  title?: string;
}

function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

export function LocationMap({
  lat,
  lon,
  zoom = 12,
  className,
  title,
}: LocationMapProps) {
  const [loaded, setLoaded] = useState(false);
  const valid = isValidCoordinate(lat, lon);

  const padding = 0.01 / zoom;
  const bbox = `${lon - padding},${lat - padding},${lon + padding},${lat + padding}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const viewUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;

  useEffect(() => {
    setLoaded(false);
  }, [embedUrl]);

  if (!valid) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center",
          className,
        )}
      >
        <MapPin className="mb-2 size-6 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Map not available</p>
        <p className="text-xs text-muted-foreground/70">
          Coordinates not provided for this venue
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative overflow-hidden rounded-xl border border-border/60">
        {!loaded && (
          <Skeleton className="absolute inset-0 z-10 h-full w-full" />
        )}
        <iframe
          title={title ?? "Conference venue map"}
          src={embedUrl}
          className="h-[300px] w-full border-0 md:h-[400px]"
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      </div>
      <a
        href={viewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        View on OpenStreetMap
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}
