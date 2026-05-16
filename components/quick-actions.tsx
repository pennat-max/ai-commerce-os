"use client";

import { useState } from "react";
import { CheckCircle2, LockKeyhole } from "lucide-react";

type ActionState = {
  title: string;
  detail: string;
  tone: "green" | "blue" | "orange" | "slate";
};

const actionCopy: Record<string, ActionState> = {
  apply: {
    title: "เตรียมสมัครแคมเปญแล้ว",
    detail: "ระบบสร้างรายการรออนุมัติแบบ Manual Mode",
    tone: "green",
  },
  price: {
    title: "จำลองการปรับราคาแล้ว",
    detail: "ราคาจะยังไม่ถูกส่งไป marketplace จริง",
    tone: "blue",
  },
  stop: {
    title: "จำลองการหยุดแคมเปญแล้ว",
    detail: "แคมเปญถูกทำเครื่องหมายว่าเฝ้าระวัง",
    tone: "orange",
  },
};

const buttonClass = {
  green:
    "border-emerald-200 bg-emerald-500/90 text-white shadow-emerald-100 hover:bg-emerald-600",
  blue: "border-blue-200 bg-blue-500/90 text-white shadow-blue-100 hover:bg-blue-600",
  orange:
    "border-orange-200 bg-orange-400 text-white shadow-orange-100 hover:bg-orange-500",
};

export function QuickActions() {
  const [lastAction, setLastAction] = useState<ActionState | null>(null);

  return (
    <div className="grid gap-3">
      {[
        ["apply", "สมัครแคมเปญ", "green"],
        ["price", "ปรับราคา", "blue"],
        ["stop", "หยุดแคมเปญ", "orange"],
      ].map(([key, label, tone]) => (
        <button
          key={key}
          className={`min-h-12 rounded-lg border px-4 text-sm font-black shadow-sm transition ${buttonClass[tone as keyof typeof buttonClass]}`}
          onClick={() => setLastAction(actionCopy[key])}
        >
          {label}
        </button>
      ))}

      <button
        className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-300 px-4 text-sm font-black text-slate-600 shadow-sm"
        disabled
      >
        <LockKeyhole size={16} />
        ตั้งค่า Auto Mode
      </button>

      {lastAction ? (
        <div className="rounded-lg border border-sky-100 bg-white p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} />
            <div>
              <p className="text-sm font-black text-slate-900">{lastAction.title}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">{lastAction.detail}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
