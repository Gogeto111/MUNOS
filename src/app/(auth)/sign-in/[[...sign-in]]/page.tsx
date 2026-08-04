"use client";

import { SignIn } from "@clerk/nextjs";
import { isAuthConfigured } from "@/lib/public-env";
import { NotConfigured } from "@/components/auth/not-configured";

export default function SignInPage() {
  if (!isAuthConfigured) {
    return <NotConfigured mode="sign-in" />;
  }

  return (
    <SignIn
      routing="path"
      path="/sign-in"
      appearance={{
        elements: {
          card: "shadow-xl shadow-black/[0.05]",
        },
      }}
      forceRedirectUrl="/dashboard"
    />
  );
}
