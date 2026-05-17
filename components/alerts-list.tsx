"use client";

import { Bell, Mail, MessageCircle } from "lucide-react";
import { markAlertReadAction } from "@/app/app/actions";
import { StatusBadge } from "@/components/status";
import type { Alert, DecisionStatus } from "@/types/domain";

const icons = { line: MessageCircle, email: Mail, dashboard: Bell };
const channelLabel = { line: "LINE mock", email: "Email mock", dashboard: "Dashboard" };

export function AlertsList({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="grid gap-3">
      {alerts.map((alert) => {
        const Icon = icons[alert.channel];
        return (
          <article
            key={alert.id}
            className={`rounded-xl border p-3 ${alert.isRead ? "border-slate-100 bg-slate-50 opacity-70" : "border-sky-100 bg-white"}`}
          >
            <div className="flex gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Icon size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                      {channelLabel[alert.channel]}
                    </p>
                    <h3 className="mt-1 text-base font-black text-slate-950">{alert.title}</h3>
                  </div>
                  <StatusBadge status={alert.severity as DecisionStatus} />
                </div>
                <p className="mt-2 text-sm font-bold text-slate-600">{alert.message}</p>
                {!alert.isRead ? (
                  <form action={markAlertReadAction.bind(null, alert.id)} className="mt-3">
                    <button
                      type="submit"
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white"
                    >
                      ทำเครื่องหมายว่าอ่านแล้ว
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

