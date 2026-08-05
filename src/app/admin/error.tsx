"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center text-center p-8">
          <div className="mb-4 grid size-14 place-items-center rounded-full bg-red-500/10">
            <AlertTriangle className="size-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold">Admin error</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            An error occurred in the admin panel. Please try again.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Error: {error.digest}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
            <Button asChild>
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
