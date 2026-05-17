"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Boxes,
  CreditCard,
  Home,
  MessageCircle,
  PackageSearch,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const sellerNav: NavItem[] = [
  { href: "/app", label: "วันนี้", icon: Home },
  { href: "/app/inbox", label: "แชท", icon: MessageCircle },
  { href: "/app/products", label: "สินค้า", icon: Boxes },
  { href: "/app/campaigns", label: "แคมเปญ", icon: PackageSearch },
  { href: "/app/assistant", label: "ถาม AI", icon: Bot },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "ภาพรวม", icon: ShieldCheck },
  { href: "/admin/customers", label: "ลูกค้า", icon: Users },
  { href: "/admin/plans", label: "แพ็กเกจ", icon: CreditCard },
  { href: "/admin/usage", label: "การใช้งาน", icon: BarChart3 },
];

function isActive(pathname: string, href: string) {
  if (href === "/app" || href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ mode }: { mode: "seller" | "admin" }) {
  const pathname = usePathname();
  const items = mode === "admin" ? adminNav : sellerNav;
  const mobileColumns = mode === "admin" ? "grid-cols-4" : "grid-cols-5";

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
            href={item.href}
            className={`flex min-h-[4.25rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-1.5 text-center text-[10px] font-black transition active:scale-[0.98] md:min-h-11 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-left md:text-sm ${
              active
                ? "bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] md:bg-emerald-700 md:shadow-none"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
          >
            <Icon size={21} strokeWidth={active ? 2.5 : 2} />
            <span className="leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
