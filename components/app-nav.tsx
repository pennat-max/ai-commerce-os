"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  Home,
  Menu,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { navCopy, type Locale, withLocalePath } from "@/lib/i18n";

type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

const sellerNav: NavItem[] = [
  { href: "/app", labelKey: "home", icon: Home },
  { href: "/app/inbox", labelKey: "inbox", icon: MessageCircle },
  { href: "/app/opportunities", labelKey: "opportunities", icon: BarChart3 },
  { href: "/app/assistant", labelKey: "assistant", icon: Sparkles },
  { href: "/app/settings", labelKey: "menu", icon: Menu },
];

const adminNav: NavItem[] = [
  { href: "/admin", labelKey: "overview", icon: ShieldCheck },
  { href: "/admin/customers", labelKey: "customers", icon: Users },
  { href: "/admin/plans", labelKey: "plans", icon: CreditCard },
  { href: "/admin/usage", labelKey: "usage", icon: BarChart3 },
];

function isActive(pathname: string, href: string) {
  if (href === "/app" || href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ mode, locale }: { mode: "seller" | "admin"; locale: Locale }) {
  const pathname = usePathname();
  const items = mode === "admin" ? adminNav : sellerNav;
  const mobileColumns = mode === "admin" ? "grid-cols-4" : "grid-cols-5";
  const labels = mode === "admin" ? navCopy[locale].admin : navCopy[locale].seller;

  return (
    <nav
      className={`grid ${mobileColumns} gap-1.5 pb-1.5 md:flex md:flex-col md:overflow-visible md:pb-0`}
      aria-label="เมนูหลัก"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={withLocalePath(item.href, locale)}
            className={`flex min-h-[3.75rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-1 text-center text-[9px] font-black transition active:scale-[0.98] md:min-h-11 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-left md:text-sm ${
              active
                ? "bg-violet-50 text-violet-600 md:bg-emerald-700 md:text-white"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span className="leading-tight">{labels[item.labelKey as keyof typeof labels]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
