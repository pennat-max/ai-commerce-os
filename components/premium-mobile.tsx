import Link from "next/link";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PremiumTone = "emerald" | "sky" | "amber" | "rose" | "violet" | "slate";

const toneStyles: Record<
  PremiumTone,
  {
    panel: string;
    icon: string;
    text: string;
    chip: string;
    button: string;
  }
> = {
  emerald: {
    panel: "border-emerald-100 bg-emerald-50/80",
    icon: "bg-emerald-600 text-white",
    text: "text-emerald-800",
    chip: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    button: "bg-emerald-700 text-white",
  },
  sky: {
    panel: "border-sky-100 bg-sky-50/80",
    icon: "bg-sky-600 text-white",
    text: "text-sky-800",
    chip: "bg-sky-100 text-sky-800 ring-sky-200",
    button: "bg-sky-700 text-white",
  },
  amber: {
    panel: "border-amber-100 bg-amber-50/80",
    icon: "bg-amber-500 text-white",
    text: "text-amber-800",
    chip: "bg-amber-100 text-amber-800 ring-amber-200",
    button: "bg-amber-500 text-white",
  },
  rose: {
    panel: "border-rose-100 bg-rose-50/80",
    icon: "bg-rose-600 text-white",
    text: "text-rose-800",
    chip: "bg-rose-100 text-rose-800 ring-rose-200",
    button: "bg-rose-600 text-white",
  },
  violet: {
    panel: "border-violet-100 bg-violet-50/80",
    icon: "bg-violet-600 text-white",
    text: "text-violet-800",
    chip: "bg-violet-100 text-violet-800 ring-violet-200",
    button: "bg-violet-700 text-white",
  },
  slate: {
    panel: "border-slate-100 bg-white/85",
    icon: "bg-slate-900 text-white",
    text: "text-slate-700",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
    button: "bg-slate-900 text-white",
  },
};

export function PremiumSection({
  title,
  helper,
  children,
  action,
}: {
  title: string;
  helper?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black leading-tight text-slate-950">{title}</h2>
          {helper ? <p className="mt-1 text-sm font-bold leading-6 text-slate-500">{helper}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PremiumPanel({
  children,
  tone = "slate",
  className = "",
}: {
  children: React.ReactNode;
  tone?: PremiumTone;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.75rem] border p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur ${toneStyles[tone].panel} ${className}`}
    >
      {children}
    </section>
  );
}

export function PremiumIntro({
  eyebrow,
  title,
  description,
  icon: Icon = Sparkles,
  tone = "emerald",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  tone?: PremiumTone;
  children?: React.ReactNode;
}) {
  return (
    <PremiumPanel tone={tone} className="overflow-hidden">
      <div className="flex items-start gap-3">
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${toneStyles[tone].icon}`}>
          <Icon size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-black ${toneStyles[tone].text}`}>{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </PremiumPanel>
  );
}

export function KpiCard({
  label,
  value,
  helper,
  tone = "emerald",
  icon: Icon,
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: PremiumTone;
  icon?: LucideIcon;
}) {
  return (
    <div className={`min-h-[7.75rem] rounded-[1.5rem] border p-4 shadow-sm ${toneStyles[tone].panel}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black leading-tight text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black leading-tight text-slate-950">{value}</p>
        </div>
        {Icon ? (
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${toneStyles[tone].icon}`}>
            <Icon size={20} />
          </span>
        ) : null}
      </div>
      {helper ? <p className={`mt-3 text-xs font-bold leading-5 ${toneStyles[tone].text}`}>{helper}</p> : null}
    </div>
  );
}

export function StatusSummaryCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string; tone: PremiumTone }>;
}) {
  return (
    <PremiumPanel tone="slate">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className={`rounded-2xl border p-3 ${toneStyles[item.tone].panel}`}>
            <p className="text-xs font-black text-slate-500">{item.label}</p>
            <p className={`mt-1 text-2xl font-black ${toneStyles[item.tone].text}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </PremiumPanel>
  );
}

export function AiInsightCard({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <PremiumPanel tone="violet" className="relative overflow-hidden">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white">
          <Bot size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-violet-700">คำแนะนำจาก AI</p>
          <h2 className="mt-1 text-xl font-black leading-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <Link
        href={ctaHref}
        className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white"
      >
        {ctaLabel}
        <ArrowRight size={17} />
      </Link>
    </PremiumPanel>
  );
}

export function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  tone = "emerald",
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: PremiumTone;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-24 flex-col justify-between rounded-[1.5rem] border p-4 shadow-sm transition active:scale-[0.99] ${toneStyles[tone].panel}`}
    >
      <span className={`flex size-10 items-center justify-center rounded-2xl ${toneStyles[tone].icon}`}>
        <Icon size={20} />
      </span>
      <span>
        <span className="block text-sm font-black leading-tight text-slate-950">{title}</span>
        <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">{description}</span>
      </span>
    </Link>
  );
}

export function PremiumFeedCard({
  icon: Icon,
  title,
  description,
  tone = "slate",
  badge,
  children,
  href,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  tone?: PremiumTone;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <article className={`rounded-[1.5rem] border p-4 shadow-sm ${toneStyles[tone].panel}`}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${toneStyles[tone].icon}`}>
            <Icon size={22} />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-black leading-tight text-slate-950">{title}</h3>
            {badge}
          </div>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </article>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block transition active:scale-[0.99]">
      {content}
    </Link>
  );
}

export function PremiumChip({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: PremiumTone;
}) {
  return (
    <span className={`inline-flex min-h-9 items-center rounded-full px-3 text-xs font-black ring-1 ${toneStyles[tone].chip}`}>
      {children}
    </span>
  );
}

export function PremiumEmptyState({
  title,
  description,
  icon: Icon = Sparkles,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <PremiumPanel tone="slate" className="text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Icon size={24} />
      </span>
      <p className="mt-3 text-base font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-slate-500">{description}</p>
    </PremiumPanel>
  );
}
