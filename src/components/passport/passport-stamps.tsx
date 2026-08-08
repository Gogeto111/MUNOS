"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCountryFlag, TOTAL_UN_COUNTRIES } from "@/lib/country-flags";
import { Stamp } from "lucide-react";

interface StampEntry {
  country: string;
  conferenceName: string | null;
}

interface PassportStampsProps {
  countries: StampEntry[];
}

export function PassportStamps({ countries }: PassportStampsProps) {
  const collected = countries.length;
  const progress = Math.round((collected / TOTAL_UN_COUNTRIES) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Stamp className="size-4" /> Passport Stamps
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {collected} / {TOTAL_UN_COUNTRIES}
          </Badge>
        </div>
        <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progress}% of UN member states represented
        </p>
      </CardHeader>
      <CardContent>
        {collected === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 grid size-12 place-items-center rounded-full bg-muted/50">
              <Stamp className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No stamps collected yet</p>
            <p className="text-xs text-muted-foreground">
              Start representing countries to fill your passport!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {countries.map((c, i) => (
              <div
                key={i}
                className="group relative flex flex-col items-center rounded-lg border border-border/60 bg-gradient-to-b from-background to-muted/20 p-3 transition-all hover:border-brand-500/30 hover:shadow-sm"
              >
                <span className="text-2xl leading-none" role="img" aria-label={c.country}>
                  {getCountryFlag(c.country)}
                </span>
                <span className="mt-1.5 text-center text-xs font-medium leading-tight">
                  {c.country}
                </span>
                {c.conferenceName && (
                  <span className="mt-0.5 text-center text-[10px] text-muted-foreground leading-tight truncate max-w-full">
                    {c.conferenceName}
                  </span>
                )}
                <div className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-brand-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
