"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/status";
import { StatBox } from "@/components/commerce-card";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { saveCampaignDecisionAction } from "@/lib/client-db";
import { formatBaht, formatPercent } from "@/lib/profit";
import type { Campaign, DecisionAction, Product } from "@/types/domain";

type CampaignDecisionListProps = {
  campaigns: Campaign[];
  products: Product[];
};

const actionLabel: Record<DecisionAction, string> = {
  approve: "อนุมัติแล้ว",
  reject: "ปฏิเสธแล้ว",
  watch: "เฝ้าดูต่อ",
};

const actionClass: Record<DecisionAction, string> = {
  approve: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  reject: "bg-rose-50 text-rose-700 ring-rose-200",
  watch: "bg-orange-50 text-orange-700 ring-orange-200",
};

const storageKey = "ai-commerce-os-campaign-decisions";

export function CampaignDecisionList({ campaigns, products }: CampaignDecisionListProps) {
  const rows = useMemo(
    () =>
      campaigns.map((campaign) => {
        const product = products.find((item) => item.id === campaign.productId)!;
        return { campaign, product, decision: recommendCampaignDecision(product, campaign) };
      }),
    [campaigns, products],
  );
  const [actions, setActions] = useState<Record<string, DecisionAction>>(() => {
    const defaults = Object.fromEntries(
      rows.map(({ campaign }) => [campaign.id, "watch" as DecisionAction]),
    );

    if (typeof window === "undefined") return defaults;

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaults;

    try {
      return { ...defaults, ...(JSON.parse(raw) as Record<string, DecisionAction>) };
    } catch {
      window.localStorage.removeItem(storageKey);
      return defaults;
    }
  });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<Record<string, string>>({});

  async function setDecision(campaignId: string, action: DecisionAction) {
    setActions((current) => {
      const next = { ...current, [campaignId]: action };
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    setLastUpdated(campaignId);
    setSyncState((current) => ({ ...current, [campaignId]: "กำลังบันทึก..." }));

    const result = await saveCampaignDecisionAction(campaignId, action);
    setSyncState((current) => ({
      ...current,
      [campaignId]: result.ok
        ? "บันทึกลง Supabase แล้ว"
        : result.source === "mock"
          ? "บันทึก mock ใน browser"
          : `บันทึก DB ไม่สำเร็จ: ${result.error}`,
    }));
  }

  return (
    <div className="grid gap-3">
      {rows.map(({ campaign, product, decision }) => {
        const currentAction = actions[campaign.id];

        return (
          <article key={campaign.id} className="rounded-xl border border-sky-100 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-950">{campaign.name}</h3>
                <p className="text-xs font-bold text-slate-500">
                  {product.sku} · {campaign.startsAt} ถึง {campaign.endsAt}
                </p>
              </div>
              <StatusBadge status={decision.recommendation} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
              <StatBox
                label="กำไรสุทธิ"
                value={formatBaht(decision.profit.netProfit)}
                tone={decision.profit.netProfit <= 0 ? "red" : "green"}
              />
              <StatBox label="Margin" value={formatPercent(decision.profit.marginPercent)} />
              <StatBox label="ส่วนลด" value={formatBaht(campaign.campaignDiscount)} />
              <StatBox label="Voucher" value={formatBaht(campaign.shopVoucher)} />
              <StatBox label="Shipping" value={formatBaht(campaign.shippingSubsidy)} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-lg px-3 py-2 text-xs font-black ring-1 ${actionClass[currentAction]}`}
              >
                {actionLabel[currentAction]}
              </span>
              {lastUpdated === campaign.id ? (
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  {syncState[campaign.id] ?? "บันทึก mock แล้ว"}
                </span>
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              <button
                className="min-h-11 rounded-lg border border-emerald-200 bg-emerald-500/90 text-sm font-black text-white shadow-sm shadow-emerald-100"
                onClick={() => setDecision(campaign.id, "approve")}
              >
                Approve
              </button>
              <button
                className="min-h-11 rounded-lg border border-orange-200 bg-orange-400 text-sm font-black text-white shadow-sm shadow-orange-100"
                onClick={() => setDecision(campaign.id, "watch")}
              >
                Watch
              </button>
              <button
                className="min-h-11 rounded-lg border border-rose-200 bg-rose-500/90 text-sm font-black text-white shadow-sm shadow-rose-100"
                onClick={() => setDecision(campaign.id, "reject")}
              >
                Reject
              </button>
              <Link
                href={`/app/campaigns/${campaign.id}`}
                className="flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-900 text-sm font-black text-white"
              >
                Detail
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
