"use client";

import { createContext, useContext } from "react";
import type { AppSession } from "@/types/auth";

const SessionContext = createContext<AppSession | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: AppSession;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useAppSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useAppSession must be used within SessionProvider");
  }
  return session;
}
