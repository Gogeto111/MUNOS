"use client";

import {
  Globe,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">AI News Engine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            UN feeds, global events, and AI-powered summaries for MUN preparation.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search news..." className="pl-9" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Globe className="mb-4 size-10 text-muted-foreground" />
                <p className="text-sm font-medium">No news articles yet</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  UN news feeds and AI-powered summaries will appear here once connected. Check back soon.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Topic Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground text-center py-4">
                  Topic tracking will populate as news articles are ingested.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground text-center py-4">
                  Upcoming UN events will be listed here.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["UN News", "WHO", "UN Security Council", "IMF", "OHCHR"].map((source) => (
                  <div key={source} className="flex items-center gap-2 text-sm">
                    <Globe className="size-3.5 text-muted-foreground" /> {source}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
