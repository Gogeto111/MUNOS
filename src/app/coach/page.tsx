"use client";

import {
  Camera,
  FileVideo,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">AI Video Coach</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload speeches, get AI-powered feedback on delivery, persuasion, and clarity.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="size-5 text-brand-600" /> Upload Speech
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 p-12 text-center hover:border-brand-500/50 transition-colors">
                  <Upload className="mb-3 size-10 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium">Drop your video here or click to browse</p>
                  <p className="text-xs text-muted-foreground">
                    MP4, MOV, or WebM — Max 500MB
                  </p>
                  <Button className="mt-4 gap-2">
                    <Upload className="size-3.5" /> Upload Video
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileVideo className="mb-4 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No coaching sessions yet</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Upload a speech video to get AI-powered feedback on your delivery, persuasion, and clarity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Camera className="mb-4 size-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No analysis yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload a speech to receive detailed AI feedback.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-xs text-muted-foreground">
                    Your progress chart will appear after your first session.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
