"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  Home,
  PackageSearch,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const sellerNav: NavItem[] = [
  { href: "/app", label: "ภาพรวม", icon: Home },
  { href: "/app/products", label: "สินค้า", icon: Boxes },
  { href: "/app/campaigns", label: "แคมเปญ", icon: PackageSearch },
  { href: "/app/profit-rules", label: "กฎกำไร", icon: SlidersHorizontal },
  { href: "/app/alerts", label: "แจ้งเตือน", icon: Bell },
  { href: "/app/settings", label: "ตั้งค่า", icon: Settings },
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

  return (
    <nav
      className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-col md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
      aria-label="เมนูหลัก"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-[3.25rem] min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-center text-[10px] font-bold transition md:min-h-11 md:min-w-0 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-left md:text-sm ${
              active
                ? "bg-emerald-700 text-white shadow-sm md:shadow-none"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span className="leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
