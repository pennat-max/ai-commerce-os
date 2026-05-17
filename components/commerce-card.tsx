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
    <section className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/80 backdrop-blur">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50/90 via-sky-50/80 to-violet-50/70 px-4 py-3.5">
        <h2 className="text-lg font-black leading-tight text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="p-4 md:p-5">{children}</div>
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
    <div className="min-h-[5.75rem] rounded-[1.25rem] border border-white/80 bg-white/80 p-3.5 shadow-sm">
      <p className="text-xs font-black leading-tight text-slate-500">{label}</p>
      <p className={`mt-1.5 text-xl font-black leading-tight ${toneClass}`}>{value}</p>
      {helper ? <p className="mt-1 text-xs font-bold leading-tight text-slate-400">{helper}</p> : null}
    </div>
  );
}
