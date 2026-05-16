"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function LogoutButton() {
  const router = useRouter();

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.localStorage.removeItem("ai-commerce-os-session");
    router.push("/login");
  }

  return (
    <button
      className="flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
      aria-label="ออกจากระบบ"
      onClick={signOut}
    >
      <LogOut size={20} />
    </button>
  );
}
