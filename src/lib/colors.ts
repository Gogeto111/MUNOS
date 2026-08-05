type ColorName = "brand" | "amber" | "emerald" | "red" | "blue" | "purple" | "rose" | "slate";

const colorMap: Record<ColorName, { bg: string; text: string; dot: string }> = {
  brand:   { bg: "bg-brand-500/10", text: "text-brand-600 dark:text-brand-400", dot: "bg-brand-500" },
  amber:   { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  red:     { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
  blue:    { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  purple:  { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500" },
  rose:    { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  slate:   { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-500" },
};

export function colorClasses(color: string) {
  const c = colorMap[color as ColorName] ?? colorMap.brand;
  return c;
}

export function colorBg(color: string) {
  return colorClasses(color).bg;
}

export function colorText(color: string) {
  return colorClasses(color).text;
}

export function colorDot(color: string) {
  return colorClasses(color).dot;
}
