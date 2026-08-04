"use client";

import * as React from "react";
import { useSavedConferences } from "@/hooks/use-saved-conferences";

const SavedContext = React.createContext<ReturnType<typeof useSavedConferences> | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const value = useSavedConferences();
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): ReturnType<typeof useSavedConferences> {
  const context = React.useContext(SavedContext);
  if (!context) {
    throw new Error("useSaved must be used within a SavedProvider");
  }
  return context;
}
