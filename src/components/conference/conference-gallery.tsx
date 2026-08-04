"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  url: string;
  alt: string | null;
  caption: string | null;
}

export function ConferenceGallery({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = React.useState<number | null>(null);

  const close = () => setActive(null);
  const prev = () => setActive((i) => (i === null ? i : (i + items.length - 1) % items.length));
  const next = () => setActive((i) => (i === null ? i : (i + 1) % items.length));

  React.useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.slice(0, 6).map((item, index) => (
        <button
          key={`${item.url}-${index}`}
          type="button"
          onClick={() => setActive(index)}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={item.caption ?? item.alt ?? `Gallery image ${index + 1}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={item.alt ?? ""}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {index === 5 && items.length > 6 ? (
            <div className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-semibold text-white">
              +{items.length - 6}
            </div>
          ) : null}
        </button>
      ))}

      {active !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={close}
            aria-label="Close gallery"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous image"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next image"
          >
            <ChevronRight className="size-5" />
          </button>
          <figure
            className={cn("max-h-full max-w-5xl")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={items[active].url}
              alt={items[active].alt ?? ""}
              className="mx-auto max-h-[80vh] rounded-lg object-contain"
            />
            {items[active].caption ? (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {items[active].caption}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </div>
  );
}
