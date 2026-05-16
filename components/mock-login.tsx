"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ShieldCheck, Store, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/domain";

type LoginOption = {
  role: UserRole;
  title: string;
  description: string;
  href: string;
  icon: typeof Store;
};

const options: LoginOption[] = [
  {
    role: "CUSTOMER_OWNER",
    title: "เข้าสู่ Seller Dashboard",
    description: "จัดการร้าน สินค้า กฎกำไร และอนุมัติแคมเปญ",
    href: "/app",
    icon: Store,
  },
  {
    role: "CUSTOMER_STAFF",
    title: "เข้าสู่ Staff View",
    description: "ดูและอัปเดตสินค้า/แคมเปญในองค์กรเท่านั้น",
    href: "/app/products",
    icon: Users,
  },
  {
    role: "SUPER_ADMIN",
    title: "เข้าสู่ Super Admin",
    description: "ดูภาพรวมลูกค้า แพ็กเกจ usage และ alerts ทั้งระบบ",
    href: "/admin",
    icon: ShieldCheck,
  },
];

export function MockLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("mock-password");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function setMockSession(option: LoginOption) {
    window.localStorage.setItem(
      "ai-commerce-os-session",
      JSON.stringify({
        role: option.role,
        organizationId: option.role === "SUPER_ADMIN" ? null : "org-1",
        organizationName: option.role === "SUPER_ADMIN" ? "AI Commerce OS" : "บ้านสวยออนไลน์",
        signedInAt: new Date().toISOString(),
      }),
    );
    router.push(option.href);
  }

  async function signIn(option: LoginOption) {
    setMessage(null);

    if (!supabase) {
      setMockSession(option);
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      setMessage(`Supabase login failed: ${error.message}. Using mock role for Phase 1 demo.`);
      setMockSession(option);
      return;
    }

    window.localStorage.setItem(
      "ai-commerce-os-session",
      JSON.stringify({
        role: option.role,
        organizationId: option.role === "SUPER_ADMIN" ? null : "org-1",
        organizationName: option.role === "SUPER_ADMIN" ? "AI Commerce OS" : "บ้านสวยออนไลน์",
        authProvider: "supabase",
        signedInAt: new Date().toISOString(),
      }),
    );
    router.push(option.href);
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <label className="text-sm font-bold text-slate-600">อีเมล</label>
      <input
        className="mt-2 h-14 w-full rounded-2xl border border-slate-200 px-4 text-base outline-none focus:border-emerald-600"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <label className="mt-4 block text-sm font-bold text-slate-600">รหัสผ่าน</label>
      <input
        className="mt-2 h-14 w-full rounded-2xl border border-slate-200 px-4 text-base outline-none focus:border-emerald-600"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        type="password"
      />

      {message ? (
        <div className="mt-4 flex gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{message}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.role}
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 px-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              onClick={() => signIn(option)}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
                <Icon size={21} />
              </span>
              <span>
                <span className="block text-sm font-black text-slate-950">{option.title}</span>
                <span className="mt-1 block text-xs font-bold text-slate-500">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
