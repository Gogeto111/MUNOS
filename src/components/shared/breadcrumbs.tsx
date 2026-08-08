"use client";

import { Breadcrumb } from "@/components/shared/breadcrumb";

export interface BreadcrumbsItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbsItem[];
  className?: string;
}) {
  return <Breadcrumb items={items} className={className} />;
}
