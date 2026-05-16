import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  Building2,
  CreditCard,
  Home,
  LineChart,
  PackageSearch,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Users,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { MockSessionBadge } from "@/components/mock-session-badge";
import { RouteAccessNote } from "@/components/route-access-note";
import type { UserRole } from "@/types/domain";

const sellerNav = [
  { href: "/app", label: "ภาพรวม", icon: Home },
  { href: "/app/products", label: "สินค้า", icon: Boxes },
  { href: "/app/campaigns", label: "แคมเปญ", icon: PackageSearch },
  { href: "/app/profit-rules", label: "กฎกำไร", icon: SlidersHorizontal },
  { href: "/app/alerts", label: "แจ้งเตือน", icon: Bell },
  { href: "/app/settings", label: "ตั้งค่า", icon: Settings },
];

const adminNav = [
  { href: "/admin", label: "เจ้าของระบบ", icon: ShieldCheck },
  { href: "/admin/customers", label: "ลูกค้า", icon: Users },
  { href: "/admin/plans", label: "แพ็กเกจ", icon: CreditCard },
  { href: "/admin/usage", label: "การใช้งาน", icon: BarChart3 },
];

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
  const nav = mode === "admin" ? adminNav : sellerNav;
  const allowedRoles: UserRole[] =
    mode === "admin" ? ["SUPER_ADMIN"] : ["CUSTOMER_OWNER", "CUSTOMER_STAFF"];

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-slate-950">
      <aside className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur md:inset-y-0 md:left-0 md:right-auto md:w-64 md:border-r md:border-t-0 md:px-4 md:py-5">
        <Link href="/app" className="mb-6 hidden items-center gap-3 px-2 md:flex">
          <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <Bot size={24} />
          </span>
          <span>
            <span className="block text-base font-black">AI Commerce OS</span>
            <span className="block text-xs text-slate-500">Manual Mode MVP</span>
          </span>
        </Link>
        <nav className="grid grid-cols-6 gap-1 md:flex md:flex-col md:gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-center text-[11px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 md:min-h-12 md:flex-row md:justify-start md:gap-3 md:text-sm"
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="pb-24 md:ml-64 md:pb-0">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#f6f7f4]/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                {mode === "admin" ? "SUPER_ADMIN" : "CUSTOMER_OWNER"}
              </p>
              <h1 className="text-2xl font-black text-slate-950 md:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <MockSessionBadge fallbackRole={mode === "admin" ? "SUPER_ADMIN" : "CUSTOMER_OWNER"} />
              <LogoutButton />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">
          <RouteAccessNote allowedRoles={allowedRoles} />
          {children}
        </div>
      </main>
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      {action}
    </div>
  );
}

export function ModeSwitch() {
  return (
    <div className="grid grid-cols-2 rounded-2xl bg-slate-200 p-1 text-sm font-black">
      <button className="min-h-12 rounded-xl bg-emerald-700 px-4 text-white shadow-sm">
        Manual Mode
      </button>
      <button className="min-h-12 rounded-xl px-4 text-slate-400" disabled>
        Auto Mode เร็วๆ นี้
      </button>
    </div>
  );
}

export function StorePill() {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
      <Store size={18} className="text-emerald-700" />
      บ้านสวยออนไลน์ · 3 ร้าน
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
            Phase 1 ใช้ Manual Mode เท่านั้น ระบบคำนวณและแนะนำ แต่ยังไม่ส่งคำสั่งไป Marketplace จริง
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
