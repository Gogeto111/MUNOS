import { Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotConfigured({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <Card className="border-border/70 shadow-lg shadow-black/[0.04]">
      <CardHeader className="items-center text-center">
        <div className="mb-3 grid size-12 place-items-center rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Settings2 className="size-6" />
        </div>
        <CardTitle className="text-lg">
          Authentication not configured yet
        </CardTitle>
        <CardDescription className="mx-auto max-w-sm">
          Clerk keys are missing. {mode === "sign-in" ? "Sign-in" : "Sign-up"}{" "}
          will go live once you add your Clerk publishable key and secret key to
          the environment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="mx-auto max-w-sm space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">
              1
            </span>
            <span>
              Create an app in the Clerk dashboard and copy the API keys.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">
              2
            </span>
            <span>
              Set <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">CLERK_SECRET_KEY</code> in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env</code>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">
              3
            </span>
            <span>Restart the dev server and you&apos;re in.</span>
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
