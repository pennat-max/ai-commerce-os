"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Bot,
  Building2,
  LineChart,
  Store,
  UserRound,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { LogoutButton } from "@/components/logout-button";
import { SessionBadge } from "@/components/session-badge";
import { useAppSession } from "@/components/session-provider";

export function AppShell({
  children,
  title,
  subtitle,
  mode = "seller",
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  mode?: "seller" | "admin";
}) {
  const session = useAppSession();
  const homeHref = mode === "admin" ? "/admin" : "/app";
  const notificationHref = mode === "admin" ? "/admin/usage" : "/app/alerts";
  const profileHref = mode === "admin" ? "/admin" : "/app/settings";
  const orgLabel = session.organizationName ?? (mode === "admin" ? "เจ้าของระบบ" : "องค์กรของคุณ");
  const roleLabel =
    {
      SUPER_ADMIN: "ผู้ดูแลระบบ",
      CUSTOMER_OWNER: "เจ้าของร้าน",
      CUSTOMER_STAFF: "ทีมร้านค้า",
    }[session.role] ?? session.role;

  const avatarLabel = session.fullName?.slice(0, 1) ?? session.email.slice(0, 1);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#ecfdf5_28%,#f8fafc_62%,#f5f3ff_100%)] text-slate-950">
      <aside className="fixed inset-x-0 bottom-0 z-20 border-t border-white/80 bg-white/90 px-2.5 pb-safe pt-2.5 shadow-[0_-18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl md:inset-y-0 md:left-0 md:right-auto md:w-64 md:border-r md:border-t-0 md:border-slate-100 md:bg-white/80 md:px-4 md:py-5 md:shadow-[18px_0_45px_rgba(15,23,42,0.06)]">
        <Link href={homeHref} className="mb-6 hidden items-center gap-3 px-2 md:flex">
          <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <Bot size={24} />
          </span>
          <span>
            <span className="block text-base font-black">AI Commerce OS</span>
            <span className="block text-xs text-slate-500">โหมดอนุมัติเอง</span>
          </span>
        </Link>
        <AppNav mode={mode} />
      </aside>

      <main className="pb-[calc(7.75rem+var(--safe-bottom))] md:ml-64 md:pb-0">
        <div className="sticky top-0 z-10 border-b border-white/70 bg-white/80 pt-safe shadow-sm backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link href={homeHref} className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <Bot size={18} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-black">AI Commerce OS</span>
                <span className="block truncate text-xs font-bold text-slate-500">{orgLabel}</span>
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={notificationHref}
                className="flex size-11 items-center justify-center rounded-full border border-white bg-white text-slate-700 shadow-sm"
                aria-label="แจ้งเตือน"
              >
                <Bell size={20} />
              </Link>
              <Link
                href={profileHref}
                className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-sm font-black text-white shadow-sm"
                aria-label="โปรไฟล์"
              >
                {avatarLabel || <UserRound size={20} />}
              </Link>
            </div>
          </div>
        </div>

        <header className="px-4 py-5 md:px-8 md:py-7">
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-emerald-700 md:text-sm">
                {roleLabel}
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950 md:text-3xl">{title}</h1>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-600">{subtitle}</p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <SessionBadge />
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-7">{children}</div>
      </main>
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      {action}
    </div>
  );
}

export function ModeSwitch() {
  return (
    <div className="grid grid-cols-2 rounded-[1.5rem] border border-white/80 bg-white/80 p-1 text-sm font-black shadow-sm">
      <button type="button" className="min-h-12 rounded-2xl bg-slate-950 px-4 text-white shadow-sm">
        อนุมัติเอง
      </button>
      <button type="button" className="min-h-12 rounded-2xl px-4 text-slate-400" disabled>
        ออโต้เร็วๆ นี้
      </button>
    </div>
  );
}

export function StorePill() {
  const session = useAppSession();

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
      <Store size={18} className="text-emerald-700" />
      {session.organizationName ?? "องค์กรของคุณ"} · 3 ร้าน
    </div>
  );
}

export function RiskCallout() {
  return (
    <div className="rounded-2xl bg-rose-700 p-5 text-white shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 shrink-0" size={24} />
        <div>
          <h3 className="font-black">ต้องตรวจแคมเปญก่อนอนุมัติ</h3>
          <p className="mt-1 text-sm text-rose-50">
            เฟสแรกให้เจ้าของร้านกดอนุมัติเอง ระบบช่วยคำนวณและแนะนำ แต่ยังไม่ส่งคำสั่งไปแพลตฟอร์มจริง
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdminSummary() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        ["องค์กรทั้งหมด", "128", Building2],
        ["ร้านที่เชื่อมต่อ", "392", Store],
        ["Decision วันนี้", "18.4K", LineChart],
      ].map(([label, value, Icon]) => (
        <div key={label as string} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <Icon className="text-emerald-700" size={24} />
          <p className="mt-4 text-sm font-bold text-slate-500">{label as string}</p>
          <p className="text-3xl font-black">{value as string}</p>
        </div>
      ))}
    </div>
  );
}
