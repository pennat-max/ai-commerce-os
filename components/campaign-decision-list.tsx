"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Megaphone } from "lucide-react";
import { PremiumEmptyState, PremiumFeedCard, type PremiumTone } from "@/components/premium-mobile";
import { StatusBadge } from "@/components/status";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { loadCampaignDecisionActions, saveCampaignDecisionAction } from "@/lib/client-db";
import { analyzeCampaignProfit } from "@/lib/profit-recommendations";
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

function DecisionMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/75 p-3 shadow-sm">
      <p className="text-xs font-black text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black leading-tight text-slate-950">{value}</p>
    </div>
  );
}

export function CampaignDecisionList({ campaigns, products }: CampaignDecisionListProps) {
  const rows = useMemo(
    () =>
      campaigns.map((campaign) => {
        const product = products.find((item) => item.id === campaign.productId)!;
        return { campaign, product, decision: recommendCampaignDecision(product, campaign) };
      }),
    [campaigns, products],
  );
  const campaignIdsKey = useMemo(
    () => rows.map(({ campaign }) => campaign.id).join(","),
    [rows],
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

  useEffect(() => {
    let isActive = true;
    const campaignIds = campaignIdsKey ? campaignIdsKey.split(",") : [];

    async function syncFromDatabase() {
      const result = await loadCampaignDecisionActions(campaignIds);
      if (!isActive || !result.ok) return;

      setActions((current) => {
        const next = { ...current, ...result.actions };
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    }

    syncFromDatabase();

    return () => {
      isActive = false;
    };
  }, [campaignIdsKey]);

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
        ? "บันทึกแล้ว"
        : result.source === "mock"
          ? "บันทึกไว้ในเครื่องนี้"
          : "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง",
    }));
  }

  return (
    <div className="grid gap-3">
      {rows.length === 0 ? (
        <PremiumEmptyState
          title="ยังไม่มีแคมเปญให้ตัดสินใจ"
          description="เมื่อมีแคมเปญใหม่ ระบบจะแสดงกำไรและคำแนะนำให้กดอนุมัติหรือปฏิเสธที่นี่"
          icon={Megaphone}
        />
      ) : null}

      {rows.map(({ campaign, product, decision }) => {
        const currentAction = actions[campaign.id];
        const advice =
          decision.recommendation !== "GOOD"
            ? analyzeCampaignProfit(product, campaign)
            : null;
        const topTip = advice?.suggestions.find((item) => item.id === "combo") ?? advice?.suggestions[0];
        const tone: PremiumTone =
          decision.recommendation === "DANGER"
            ? "rose"
            : decision.recommendation === "WARNING"
              ? "amber"
              : "emerald";

        return (
          <PremiumFeedCard
            key={campaign.id}
            icon={Megaphone}
            title={campaign.name}
            description={`${product.name} · ${campaign.startsAt} ถึง ${campaign.endsAt}`}
            tone={tone}
            badge={<StatusBadge status={decision.recommendation} />}
          >
            {topTip ? (
              <p className="mt-4 rounded-2xl bg-white/75 px-3 py-2.5 text-xs font-bold leading-5 text-slate-700 shadow-sm">
                {topTip.title}: {topTip.description}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <DecisionMetric
                label="กำไรสุทธิ"
                value={formatBaht(decision.profit.netProfit)}
              />
              <DecisionMetric label="มาร์จิน" value={formatPercent(decision.profit.marginPercent)} />
              <DecisionMetric label="ส่วนลด" value={formatBaht(campaign.campaignDiscount)} />
              <DecisionMetric label="คูปองร้าน" value={formatBaht(campaign.shopVoucher)} />
              <DecisionMetric label="ช่วยค่าส่ง" value={formatBaht(campaign.shippingSubsidy)} />
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
                  {syncState[campaign.id] ?? "บันทึกแล้ว"}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                className="min-h-12 rounded-2xl border border-emerald-200 bg-white text-sm font-black text-emerald-800 shadow-sm active:scale-[0.98]"
                onClick={() => setDecision(campaign.id, "approve")}
              >
                อนุมัติ
              </button>
              <button
                type="button"
                className="min-h-12 rounded-2xl border border-amber-200 bg-white text-sm font-black text-amber-800 shadow-sm active:scale-[0.98]"
                onClick={() => setDecision(campaign.id, "watch")}
              >
                เฝ้าดู
              </button>
              <button
                type="button"
                className="min-h-12 rounded-2xl border border-rose-200 bg-white text-sm font-black text-rose-800 shadow-sm active:scale-[0.98]"
                onClick={() => setDecision(campaign.id, "reject")}
              >
                ปฏิเสธ
              </button>
              <Link
                href={`/app/campaigns/${campaign.id}`}
                className="flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-950 text-sm font-black text-white active:scale-[0.98]"
              >
                รายละเอียด
              </Link>
            </div>
          </PremiumFeedCard>
        );
      })}
    </div>
  );
}
