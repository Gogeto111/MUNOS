"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, LogOut, User, Mail, Shield } from "lucide-react";

export function SessionInfo() {
  const { user } = useUser();
  const { signOut, sessionId } = useAuth();

  const displayName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ") || user?.username || "Anonymous";
  const email = user?.primaryEmailAddress?.emailAddress ?? "Not set";
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";
  const lastSignIn = user?.lastSignInAt
    ? new Date(user.lastSignInAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Unknown";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="size-4" /> Session
        </CardTitle>
        <CardDescription>
          Your current session details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Signed in as</p>
            <p className="text-xs text-muted-foreground">{displayName}</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Mail className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Clock className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Member since</p>
            <p className="text-xs text-muted-foreground">{createdAt}</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Last sign in</p>
              <p className="text-xs text-muted-foreground">{lastSignIn}</p>
            </div>
          </div>
        </div>

        <Separator />

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => signOut()}
        >
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
