export function CommerceCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-sky-50/50 px-4 py-3">
        <h2 className="text-base font-black text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatBox({
  label,
  value,
  helper,
  tone = "blue",
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "blue" | "green" | "orange" | "red";
}) {
  const toneClass = {
    blue: "text-emerald-700",
    green: "text-emerald-700",
    orange: "text-orange-600",
    red: "text-rose-600",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-black leading-tight ${toneClass}`}>{value}</p>
      {helper ? <p className="mt-1 text-[11px] font-bold text-slate-400">{helper}</p> : null}
    </div>
  );
}
