"use client";

import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bmV1dHJhbC1nZWNrby03NS5jbGVyay5hY2NvdW50cy5kZXYk";

export function ClerkThemedProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        ...(resolvedTheme === "dark" ? dark : {}),
        variables: {
          colorPrimary: "#4f46e5",
          borderRadius: "10px",
        },
      }}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
