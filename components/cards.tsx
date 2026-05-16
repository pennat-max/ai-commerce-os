import { TrendingUp } from "lucide-react";
import type { DashboardMetric } from "@/types/domain";

const toneClasses: Record<DashboardMetric["tone"], string> = {
  green: "bg-emerald-700 text-white",
  yellow: "bg-amber-400 text-slate-950",
  red: "bg-rose-700 text-white",
  blue: "bg-sky-700 text-white",
};

export function MetricGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className={`${toneClasses[metric.tone]} rounded-2xl p-5 shadow-sm`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold opacity-85">{metric.label}</p>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <p className="mt-4 text-3xl font-black">{metric.value}</p>
          <p className="mt-1 text-sm font-semibold opacity-85">{metric.helper}</p>
        </article>
      ))}
    </div>
  );
}

export function Panel({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">{children}</section>;
}
