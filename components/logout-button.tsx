"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function signOut() {
    setIsLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } finally {
      router.replace("/login");
      router.refresh();
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm disabled:opacity-60"
      aria-label="ออกจากระบบ"
      disabled={isLoading}
      onClick={signOut}
    >
      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
    </button>
  );
}
