import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  variant = "gradient",
}: {
  className?: string;
  variant?: "gradient" | "plain";
}) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center",
        variant === "gradient"
          ? "rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white shadow-[0_4px_20px_-4px_rgba(79,70,229,0.5)]"
          : "text-brand-600 dark:text-brand-400",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="size-[62%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 10.5h16M8 21.5h16M16 7.5v17M8.5 16h15"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <ellipse
          cx="16"
          cy="16"
          rx="8"
          ry="3.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  showText = true,
  textClassName,
}: {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showText ? (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight text-foreground",
            textClassName,
          )}
        >
          MUNOS
        </span>
      ) : null}
    </span>
  );
}
