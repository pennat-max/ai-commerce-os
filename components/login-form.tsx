"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ensureCommerceProfile } from "@/lib/auth/ensure-profile";
import { getHomePathForRole } from "@/lib/auth/routes";
import type { UserRole } from "@/types/domain";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const configError = searchParams.get("error");
  const nextPath = searchParams.get("next") ?? "/app";

  const configErrorMessage =
    configError === "supabase_not_configured"
      ? "ยังไม่ได้ตั้งค่า Supabase"
      : configError
        ? decodeURIComponent(configError)
        : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setMessage("ยังไม่ได้ตั้งค่า Supabase กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(
          error.message === "Invalid login credentials"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : error.message,
        );
        return;
      }

      if (!data.user) {
        setMessage("ไม่สามารถสร้าง session ได้");
        return;
      }

      const profileResult = await ensureCommerceProfile(supabase, data.user);

      if (!profileResult || profileResult.error) {
        setMessage(
          profileResult?.error ??
            "ไม่สามารถสร้าง profile ได้ กรุณาติดต่อผู้ดูแลระบบ",
        );
        return;
      }

      const role = profileResult.role;
      const destination = role === "SUPER_ADMIN" ? getHomePathForRole(role) : nextPath;

      // Full navigation so middleware/server receive auth cookies reliably on Vercel.
      window.location.assign(destination);
    } catch {
      setMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
      {!isSupabaseConfigured() || configError === "supabase_not_configured" ? (
        <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900 ring-1 ring-amber-100">
          ตั้งค่า Supabase ใน `.env.local` ก่อนเข้าสู่ระบบ
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-bold text-slate-600">
            อีเมล
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 h-14 w-full rounded-2xl border border-slate-200 px-4 text-base outline-none focus:border-emerald-600"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-bold text-slate-600">
            รหัสผ่าน
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 h-14 w-full rounded-2xl border border-slate-200 px-4 text-base outline-none focus:border-emerald-600"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
          />
        </div>

        {message || configErrorMessage ? (
          <div className="flex gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p>{message ?? configErrorMessage}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading || !isSupabaseConfigured()}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 text-base font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : null}
          {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </section>
  );
}
