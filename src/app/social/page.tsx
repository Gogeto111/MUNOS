"use client";

import { useState } from "react";
import {
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SocialFeed } from "@/components/social/social-feed";
import { ActivityStats } from "@/components/social/activity-stats";
import { TrendingTopics } from "@/components/social/trending-topics";
import { SuggestedUsers } from "@/components/social/suggested-users";

export default function SocialPage() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">MUN Social</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share research, insights, and questions with the MUN community.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SocialFeed topicFilter={activeTopic} />
          </div>

          <div className="space-y-4">
            <ActivityStats />
            <SuggestedUsers />
            <TrendingTopics
              activeTopic={activeTopic}
              onSelectTopic={setActiveTopic}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="size-4" /> Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>Share research findings, position papers, and debate strategies.</p>
                <p>Ask questions about procedures, topics, or country positions.</p>
                <p>Use <span className="font-semibold text-foreground">#hashtags</span> to make your posts discoverable.</p>
                <p>Use <span className="font-semibold text-foreground">@mentions</span> to tag other delegates.</p>
                <p>Be respectful and constructive in all interactions.</p>
                <Badge variant="outline" className="mt-2 text-[10px]">MUN Community Only</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
