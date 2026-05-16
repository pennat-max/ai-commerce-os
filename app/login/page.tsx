import { Bot } from "lucide-react";
import { MockLogin } from "@/components/mock-login";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f4] px-4 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <Bot size={26} />
          </span>
          <div>
            <h1 className="text-2xl font-black">AI Commerce OS</h1>
            <p className="text-sm text-slate-600">ระบบคุมกำไรสำหรับร้านค้าออนไลน์</p>
          </div>
        </div>

        <MockLogin />
        <p className="mt-5 text-center text-sm text-slate-500">
          Phase 1 ใช้ mock auth และ mock data ยังไม่เชื่อมต่อ Marketplace API จริง
        </p>
      </div>
    </main>
  );
}
