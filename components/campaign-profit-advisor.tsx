import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { CommerceCard } from "@/components/commerce-card";
import { analyzeCampaignProfit } from "@/lib/profit-recommendations";
import { formatBaht, formatPercent } from "@/lib/profit";
import type { Campaign, Product } from "@/types/domain";

export function CampaignProfitAdvisor({
  product,
  campaign,
}: {
  product: Product;
  campaign: Campaign;
}) {
  const advice = analyzeCampaignProfit(product, campaign);
  const isGood = advice.status === "GOOD";

  const bannerClass = isGood
    ? "bg-emerald-50 ring-1 ring-emerald-100"
    : advice.status === "DANGER"
      ? "bg-rose-50 ring-1 ring-rose-100"
      : "bg-amber-50 ring-1 ring-amber-100";

  const iconClass = isGood
    ? "text-emerald-700"
    : advice.status === "DANGER"
      ? "text-rose-600"
      : "text-amber-600";

  return (
    <CommerceCard title="วิเคราะห์และแนะนำให้ถึงเป้ากำไร">
      <div className={`rounded-xl p-4 ${bannerClass}`}>
        <div className="flex gap-3">
          <Lightbulb className={`mt-0.5 shrink-0 ${iconClass}`} size={22} />
          <div>
            <p className="text-sm font-black text-slate-900">{advice.summary}</p>
            <p className="mt-2 text-xs font-bold text-slate-600">
              เป้า: กำไรขั้นต่ำ {formatBaht(advice.minProfit)} · Margin ขั้นต่ำ{" "}
              {formatPercent(advice.minMarginPercent)} · ปัจจุบัน กำไร{" "}
              {formatBaht(advice.netProfit)} / Margin {formatPercent(advice.marginPercent)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {advice.suggestions.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                  item.id.includes("increase") || item.id === "ok"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-sky-100 text-sky-800"
                }`}
              >
                {item.id.includes("increase") || item.id === "ok" ? (
                  <TrendingUp size={18} />
                ) : (
                  <TrendingDown size={18} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm font-bold text-slate-600">{item.description}</p>
                {item.currentLabel && item.suggestedLabel ? (
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    จาก {item.currentLabel} →{" "}
                    <span className="text-emerald-700">{item.suggestedLabel}</span>
                    {item.impactBaht ? ` · กระทบกำไร +${formatBaht(item.impactBaht)}` : null}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </CommerceCard>
  );
}
