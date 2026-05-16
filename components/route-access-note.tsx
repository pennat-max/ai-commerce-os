"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { UserRole } from "@/types/domain";

type MockSession = {
  role: UserRole;
};

export function RouteAccessNote({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const [session] = useState<MockSession | null>(() => {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem("ai-commerce-os-session");
    if (!raw) return null;

    try {
      return JSON.parse(raw) as MockSession;
    } catch {
      return null;
    }
  });

  if (!session) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-900">
        <AlertTriangle className="mt-0.5 shrink-0" size={20} />
        <div>
          <p>ยังไม่มี mock session ใน browser นี้</p>
          <Link href="/login" className="mt-1 inline-block text-amber-700 underline">
            ไปหน้า login เพื่อเลือก role
          </Link>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(session.role)) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-900">
        <AlertTriangle className="mt-0.5 shrink-0" size={20} />
        <div>
          <p>Role ปัจจุบัน `{session.role}` ไม่ควรเข้า view นี้ในระบบจริง</p>
          <p className="mt-1 text-rose-700">Phase 1 แสดงหน้าไว้เพื่อ demo เท่านั้น</p>
        </div>
      </div>
    );
  }

  return null;
}
