"use client";

import { SignUp } from "@clerk/nextjs";
import { isAuthConfigured } from "@/lib/public-env";
import { NotConfigured } from "@/components/auth/not-configured";

export default function SignUpPage() {
  if (!isAuthConfigured) {
    return <NotConfigured mode="sign-up" />;
  }

  return (
    <SignUp
      appearance={{
        elements: {
          card: "shadow-xl shadow-black/[0.05]",
        },
      }}
      forceRedirectUrl="/dashboard"
    />
  );
}
