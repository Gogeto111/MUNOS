import Link from "next/link";
import { isAuthConfigured } from "@/lib/public-env";
import { Button } from "@/components/ui/button";
import { ClerkAuthNav } from "@/components/marketing/clerk-auth-nav";

export function AuthNav() {
  if (!isAuthConfigured) {
    return (
      <>
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Get started</Link>
        </Button>
      </>
    );
  }

  return <ClerkAuthNav />;
}
