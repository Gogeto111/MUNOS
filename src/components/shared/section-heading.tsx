import * as React from "react";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/shared/fade-in";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <FadeIn
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/8 px-3 py-1 text-xs font-medium uppercase tracking-widest text-brand-600 dark:text-brand-400">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.6rem] md:leading-[1.1]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </FadeIn>
  );
}
