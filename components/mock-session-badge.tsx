"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

type MockSession = {
  role: string;
  organizationName: string;
};

export function MockSessionBadge({ fallbackRole }: { fallbackRole: string }) {
  const [session] = useState<MockSession | null>(() => {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem("ai-commerce-os-session");
    if (!raw) return null;

    try {
      return JSON.parse(raw) as MockSession;
    } catch {
      window.localStorage.removeItem("ai-commerce-os-session");
      return null;
    }
  });

  return (
    <div className="hidden items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm sm:flex">
      <ShieldCheck size={15} className="text-emerald-700" />
      <span>{session?.role ?? fallbackRole}</span>
      <span className="text-slate-300">/</span>
      <span className="max-w-32 truncate">{session?.organizationName ?? "Mock session"}</span>
    </div>
  );
}
