"use client";

import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function ClerkThemedProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
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
