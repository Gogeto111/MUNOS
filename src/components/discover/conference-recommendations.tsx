"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Sparkles, ArrowRight } from "lucide-react";

interface Conference {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  format: string;
  difficulty: string;
  featured: boolean;
  _count: { workspaces: number };
}

interface ConferenceRecommendationsProps {
  conferences: Conference[];
}

export function ConferenceRecommendations({ conferences }: ConferenceRecommendationsProps) {
  if (conferences.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-brand-500" /> Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {conferences.map((conf) => (
          <Link
            key={conf.id}
            href={`/conference/${conf.slug}`}
            className="group block rounded-lg border border-border/60 p-3 transition-colors hover:border-brand-500/50 hover:bg-muted/40"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {conf.name}
                  </h4>
                  {conf.featured && (
                    <Badge className="gap-1 bg-brand-500 text-white">
                      <Sparkles className="size-2.5" /> Featured
                    </Badge>
                  )}
                </div>
                {conf.tagline && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{conf.tagline}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" /> {conf.city}, {conf.country}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" /> {new Date(conf.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
