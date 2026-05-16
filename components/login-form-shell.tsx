"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "@/components/login-form";

function LoginFormFallback() {
  return (
    <section className="flex min-h-48 items-center justify-center rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
      <Loader2 className="animate-spin text-emerald-700" size={28} />
    </section>
  );
}

export function LoginFormShell() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
