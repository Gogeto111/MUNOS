"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}

const STATS: StatItem[] = [
  { label: "Conferences listed", value: 2400, suffix: "+" },
  { label: "Delegates worldwide", value: 18500, suffix: "+" },
  { label: "Simulations run", value: 42000, suffix: "+" },
  { label: "Countries represented", value: 95, suffix: "+" },
];

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatBlock({ item }: { item: StatItem }) {
  const { count, ref } = useCountUp(item.value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
        {count.toLocaleString()}
        {item.suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
    </div>
  );
}

export function StatsCounter() {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
      {STATS.map((stat) => (
        <StatBlock key={stat.label} item={stat} />
      ))}
    </div>
  );
}
