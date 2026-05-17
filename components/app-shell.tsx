"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  Bot,
  Building2,
  LineChart,
  Menu,
  Sparkles,
  Store,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { LogoutButton } from "@/components/logout-button";
import { SessionBadge } from "@/components/session-badge";
import { useAppSession } from "@/components/session-provider";
import {
  appShellCopy,
  localeOptions,
  resolveLocale,
  type Locale,
  withLocalePath,
} from "@/lib/i18n";

function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function getHref(nextLocale: Locale) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLocale);
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }

  return (
    <div
      className="flex min-h-8 items-center rounded-full border border-slate-100 bg-white/90 p-0.5 text-[9px] font-black text-slate-500 shadow-sm min-[440px]:text-[10px]"
      aria-label={label}
    >
      {localeOptions.map((option) => {
        const active = option.code === locale;

        return (
          <Link
            key={option.code}
            href={getHref(option.code)}
            scroll={false}
            className={`flex min-h-7 min-w-7 items-center justify-center rounded-full px-1.5 transition min-[440px]:min-w-8 min-[440px]:px-2 ${
              active ? "bg-violet-100 text-violet-700" : "text-slate-500"
            }`}
            aria-label={option.name}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  mode = "seller",
  showPageHeader = true,
  premiumMobileFrame = false,
  locale,
  notificationCount = 8,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  mode?: "seller" | "admin";
  showPageHeader?: boolean;
  premiumMobileFrame?: boolean;
  locale?: Locale;
  notificationCount?: number;
}) {
  const session = useAppSession();
  const searchParams = useSearchParams();
  const activeLocale = locale ?? resolveLocale(searchParams.get("lang"));
  const shellCopy = appShellCopy[activeLocale];
  const homeHref = withLocalePath(mode === "admin" ? "/admin" : "/app", activeLocale);
  const notificationHref = withLocalePath(mode === "admin" ? "/admin/usage" : "/app/alerts", activeLocale);
  const profileHref = withLocalePath(mode === "admin" ? "/admin" : "/app/settings", activeLocale);
  const roleLabel = shellCopy.roles[session.role] ?? session.role;
  const avatarLabel = session.fullName?.slice(0, 1) ?? session.email.slice(0, 1);

  return (
    <div
      className={
        premiumMobileFrame
          ? "min-h-screen bg-slate-950 text-slate-950 md:bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#ecfdf5_28%,#f8fafc_62%,#f5f3ff_100%)]"
          : "min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#ecfdf5_28%,#f8fafc_62%,#f5f3ff_100%)] text-slate-950"
      }
    >
      {premiumMobileFrame ? (
        <div className="flex h-[4.2rem] items-center justify-between px-8 pt-2 text-white md:hidden" aria-hidden="true">
          <span className="text-lg font-black tracking-normal">9:41</span>
          <span className="flex items-center gap-2">
            <span className="flex h-5 items-end gap-1">
              <span className="h-2 w-1 rounded-full bg-white/70" />
              <span className="h-3 w-1 rounded-full bg-white/80" />
              <span className="h-4 w-1 rounded-full bg-white/90" />
              <span className="h-5 w-1 rounded-full bg-white" />
            </span>
            <span className="relative block size-5">
              <span className="absolute left-1/2 top-0 h-4 w-5 -translate-x-1/2 rounded-t-full border-[2px] border-b-0 border-white" />
              <span className="absolute left-1/2 top-1.5 h-3 w-3.5 -translate-x-1/2 rounded-t-full border-[2px] border-b-0 border-white" />
              <span className="absolute bottom-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-white" />
            </span>
            <span className="flex h-4 w-7 items-center rounded-[0.32rem] border border-white/80 p-0.5">
              <span className="h-full w-5 rounded-[0.2rem] bg-white" />
            </span>
          </span>
        </div>
      ) : null}

      <aside
        className={
          premiumMobileFrame
            ? "fixed inset-x-5 bottom-4 z-20 rounded-[2rem] border border-white/80 bg-white/95 px-3 pb-[calc(0.55rem+var(--safe-bottom))] pt-2.5 shadow-[0_-18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl md:inset-y-0 md:bottom-auto md:left-0 md:right-auto md:w-64 md:rounded-none md:border-r md:border-t-0 md:border-slate-100 md:bg-white/80 md:px-4 md:py-5 md:shadow-[18px_0_45px_rgba(15,23,42,0.06)]"
            : "fixed inset-x-3 bottom-3 z-20 rounded-[1.75rem] border border-white/80 bg-white/95 px-3 pb-[calc(0.55rem+var(--safe-bottom))] pt-2.5 shadow-[0_-18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl md:inset-y-0 md:bottom-auto md:left-0 md:right-auto md:w-64 md:rounded-none md:border-r md:border-t-0 md:border-slate-100 md:bg-white/80 md:px-4 md:py-5 md:shadow-[18px_0_45px_rgba(15,23,42,0.06)]"
        }
      >
        <Link href={homeHref} className="mb-6 hidden items-center gap-3 px-2 md:flex">
          <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <Bot size={24} />
          </span>
          <span>
            <span className="block text-base font-black">AI Commerce OS</span>
            <span className="block text-xs text-slate-500">{shellCopy.desktopMode}</span>
          </span>
        </Link>
        <AppNav mode={mode} locale={activeLocale} />
      </aside>

      <main
        className={
          premiumMobileFrame
            ? "min-h-[calc(100vh-4.2rem)] rounded-t-[2rem] bg-[radial-gradient(circle_at_top_left,#eff6ff_0,#ecfdf5_26%,#fbfdff_58%,#faf5ff_100%)] pb-[calc(8rem+var(--safe-bottom))] md:ml-64 md:min-h-screen md:rounded-none md:pb-0"
            : "pb-[calc(7.25rem+var(--safe-bottom))] md:ml-64 md:pb-0"
        }
      >
        <div
          className={`sticky top-0 z-10 border-b border-white/70 bg-white/90 pt-safe shadow-sm backdrop-blur-xl md:hidden ${
            premiumMobileFrame ? "rounded-t-[2rem]" : ""
          }`}
        >
          <div className={`flex items-center justify-between gap-2 py-4 ${premiumMobileFrame ? "px-5 min-[560px]:px-8" : "px-4"}`}>
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href={profileHref}
                className="flex size-9 shrink-0 items-center justify-center rounded-2xl text-slate-700"
                aria-label={shellCopy.openMenu}
              >
                <Menu size={23} />
              </Link>
              <Link href={homeHref} className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600 shadow-sm">
                  <Sparkles size={20} />
                </span>
                <span className="hidden truncate text-base font-black leading-tight text-slate-950 min-[440px]:block">
                  AI Commerce OS
                </span>
              </Link>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 min-[440px]:gap-2">
              <LanguageSwitcher locale={activeLocale} label={shellCopy.language} />
              <Link
                href={notificationHref}
                className="relative flex size-10 items-center justify-center rounded-full border border-white bg-white text-slate-700 shadow-sm"
                aria-label={shellCopy.notifications}
              >
                <Bell size={18} />
                <span className="absolute -right-0.5 -top-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                  {notificationCount}
                </span>
              </Link>
              <Link
                href={profileHref}
                className="relative flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-xs font-black text-slate-800 shadow-sm"
                aria-label={shellCopy.profile}
              >
                {avatarLabel}
                <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white bg-emerald-500" />
              </Link>
            </div>
          </div>
        </div>

        {showPageHeader ? (
          <header className="px-4 py-5 md:px-8 md:py-7">
            <div className="mx-auto flex max-w-6xl items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-emerald-700 md:text-sm">{roleLabel}</p>
                <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950 md:text-3xl">
                  {title}
                </h1>
                <p className="mt-1 text-sm font-bold leading-6 text-slate-600">{subtitle}</p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <SessionBadge />
                <LogoutButton />
              </div>
            </div>
          </header>
        ) : null}

        <div className={`mx-auto max-w-6xl py-5 md:px-8 md:py-7 ${premiumMobileFrame ? "px-5 min-[560px]:px-7" : "px-4"}`}>
          {children}
        </div>
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
