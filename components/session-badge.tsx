"use client";

import { ShieldCheck } from "lucide-react";
import { useAppSession } from "@/components/session-provider";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "แอดมิน",
  CUSTOMER_OWNER: "เจ้าของร้าน",
  CUSTOMER_STAFF: "พนักงาน",
};

export function SessionBadge({ compact = false }: { compact?: boolean }) {
  const session = useAppSession();
  const roleLabel = roleLabels[session.role] ?? session.role;

  if (compact) {
    return (
      <div
        className="flex max-w-[8rem] items-center gap-1 rounded-full border border-sky-100 bg-white px-2 py-1.5 text-[10px] font-black text-slate-600 shadow-sm"
        title={session.organizationName ?? session.fullName}
      >
        <ShieldCheck size={12} className="shrink-0 text-emerald-700" />
        <span className="truncate">{roleLabel}</span>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm sm:flex">
      <ShieldCheck size={15} className="text-emerald-700" />
      <span>{roleLabel}</span>
      <span className="text-slate-300">/</span>
      <span className="max-w-32 truncate">
        {session.organizationName ?? session.fullName}
      </span>
    </div>
  );
}
