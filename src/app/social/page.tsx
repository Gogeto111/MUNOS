"use client";

import { useState } from "react";
import {
  Globe,
  Mail,
  MessageSquare,
  Search,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<"discover" | "messages">("discover");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">MUN Social</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect with delegates, share research, and build your MUN network.
          </p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border/60">
          {[
            { label: "Discover", value: "discover" },
            { label: "Messages", value: "messages" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as never)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "discover" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search delegates..." className="pl-9" />
              </div>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="mb-4 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No delegates found yet</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    As delegates join MUNOS, they&apos;ll appear here. Start by attending a conference or joining a workspace.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Your Network</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Following</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="font-semibold">0</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Suggested</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No suggestions yet. Complete your profile to get matched.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-brand-600" /> Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare className="mb-4 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Start a conversation with fellow delegates after connecting with them.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="size-3.5" /> New Message
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="size-3.5" /> Create Group
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Globe className="size-3.5" /> Public Channels
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
