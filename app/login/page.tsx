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
        <p className="mt-5 text-center text-sm leading-relaxed text-slate-500">
          เข้าสู่ระบบด้วยบัญชี Supabase Auth
          <br />
          ยังไม่เชื่อมต่อ Marketplace API จริง
        </p>
      </div>
    </main>
  );
}
