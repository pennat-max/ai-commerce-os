export default function AppLoading() {
  return (
    <div className="grid gap-5">
      <section className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="flex items-start gap-3">
          <div className="size-12 rounded-2xl bg-emerald-100" />
          <div className="min-w-0 flex-1">
            <div className="h-3 w-24 rounded-full bg-emerald-100" />
            <div className="mt-3 h-7 w-4/5 rounded-full bg-slate-100" />
            <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
            <div className="mt-2 h-4 w-2/3 rounded-full bg-slate-100" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {["ยอดขาย", "กำไร", "เสี่ยง", "รออนุมัติ"].map((label) => (
          <div key={label} className="min-h-[7.75rem] rounded-[1.5rem] border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="h-3 w-16 rounded-full bg-slate-100" />
            <div className="mt-3 h-6 w-20 rounded-full bg-slate-100" />
            <span className="sr-only">กำลังโหลด {label}</span>
          </div>
        ))}
      </div>

      <section className="grid gap-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="h-4 w-1/2 rounded-full bg-slate-100" />
            <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
            <div className="mt-2 h-4 w-3/4 rounded-full bg-slate-100" />
          </div>
        ))}
      </section>
    </div>
  );
}
