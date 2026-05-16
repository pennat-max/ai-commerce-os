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
    <section className="rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white shadow-sm">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-sky-100 px-4 py-3">
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
    blue: "text-blue-700",
    green: "text-emerald-700",
    orange: "text-orange-600",
    red: "text-rose-600",
  }[tone];

  return (
    <div className="rounded-lg border border-sky-100 bg-white p-3">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-black ${toneClass}`}>{value}</p>
      {helper ? <p className="mt-1 text-[11px] font-bold text-slate-500">{helper}</p> : null}
    </div>
  );
}
