export default function AppLoading() {
  return (
    <div className="grid gap-4">
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
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
          <div key={label} className="min-h-[5.5rem] rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
            <div className="h-3 w-16 rounded-full bg-slate-100" />
            <div className="mt-3 h-6 w-20 rounded-full bg-slate-100" />
            <span className="sr-only">กำลังโหลด {label}</span>
          </div>
        ))}
      </div>

      <section className="grid gap-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="h-4 w-1/2 rounded-full bg-slate-100" />
            <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
            <div className="mt-2 h-4 w-3/4 rounded-full bg-slate-100" />
          </div>
        ))}
      </section>
    </div>
  );
}
