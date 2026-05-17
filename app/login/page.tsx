import { redirect } from "next/navigation";
import { Bot } from "lucide-react";
import { LoginFormShell } from "@/components/login-form-shell";
import { getHomePathForRole } from "@/lib/auth/routes";
import { getAppSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getAppSession();

  if (session) {
    redirect(getHomePathForRole(session.role));
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-4 py-6 text-slate-950 pt-safe pb-safe">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-md flex-col justify-center">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-200">
            <Bot size={26} />
          </span>
          <div>
            <h1 className="text-2xl font-black">AI Commerce OS</h1>
            <p className="text-sm text-slate-600">ระบบคุมกำไรสำหรับร้านค้าออนไลน์</p>
          </div>
        </div>

        <LoginFormShell />
        <section className="mt-4 rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
          <p className="text-sm font-black text-emerald-800">Demo access</p>
          <p className="mt-1 text-sm font-bold text-slate-700">ร้านตัวอย่าง: บ้านสวยออนไลน์</p>
          <div className="mt-3 grid gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-slate-700">
            <p>Email: owner@example.com</p>
            <p>Password: CommerceOS2026!</p>
          </div>
          <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
            ใช้ข้อมูลตัวอย่าง Shopee, Lazada และ TikTok Shop สำหรับเดโม ยังไม่เชื่อมต่อ API จริง
          </p>
        </section>
        <p className="mt-5 text-center text-sm leading-relaxed text-slate-500">
          เข้าสู่ระบบด้วยบัญชี Supabase Auth
          <br />
          ยังไม่เชื่อมต่อ Marketplace API จริง
        </p>
      </div>
    </main>
  );
}
