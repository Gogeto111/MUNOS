"use client";

import { useRouter, usePathname } from "next/navigation";
import type { DiscoverFilters } from "@/lib/search";
import { filtersToSearchParams } from "@/lib/search";

/**
 * Updates discover filters by re-serializing the current filter object into
 * the URL and navigating. All discover filter state lives in the query string,
 * so pages are server-rendered from `searchParams` and shareable/bookmarkable.
 */
export function useDiscoverUpdater(filters: DiscoverFilters) {
  const router = useRouter();
  const pathname = usePathname();

  const apply = (patch: Partial<DiscoverFilters>, replace = false) => {
    const next = { ...filters, ...patch };
    const params = filtersToSearchParams(next);
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  };

  const clear = () => {
    router.push(pathname);
  };

  return { apply, clear };
}
