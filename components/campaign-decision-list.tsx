"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/status";
import { StatBox } from "@/components/commerce-card";
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
          ? "บันทึกในเครื่องสำหรับเดโม"
          : `บันทึกไม่สำเร็จ: ${result.error}`,
    }));
  }

  return (
    <div className="grid gap-3">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
          <p className="text-base font-black text-slate-900">ยังไม่มีแคมเปญให้ตัดสินใจ</p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
            เมื่อมีแคมเปญใหม่ ระบบจะแสดงกำไรและคำแนะนำให้กดอนุมัติหรือปฏิเสธที่นี่
          </p>
        </div>
      ) : null}

      {rows.map(({ campaign, product, decision }) => {
        const currentAction = actions[campaign.id];
        const advice =
          decision.recommendation !== "GOOD"
            ? analyzeCampaignProfit(product, campaign)
            : null;
        const topTip = advice?.suggestions.find((item) => item.id === "combo") ?? advice?.suggestions[0];

        return (
          <article key={campaign.id} className="rounded-2xl border border-sky-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-black leading-tight text-slate-950">{campaign.name}</h3>
                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                  {product.sku} · {campaign.startsAt} ถึง {campaign.endsAt}
                </p>
              </div>
              <StatusBadge status={decision.recommendation} />
            </div>

            {topTip ? (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-bold leading-5 text-amber-900 ring-1 ring-amber-100">
                {topTip.title}: {topTip.description}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <StatBox
                label="กำไรสุทธิ"
                value={formatBaht(decision.profit.netProfit)}
                tone={decision.profit.netProfit <= 0 ? "red" : "green"}
              />
              <StatBox label="มาร์จิน" value={formatPercent(decision.profit.marginPercent)} />
              <StatBox label="ส่วนลด" value={formatBaht(campaign.campaignDiscount)} />
              <StatBox label="คูปองร้าน" value={formatBaht(campaign.shopVoucher)} />
              <StatBox label="ช่วยค่าส่ง" value={formatBaht(campaign.shippingSubsidy)} />
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
                  {syncState[campaign.id] ?? "บันทึกเดโมแล้ว"}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <button
                type="button"
                className="min-h-12 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-800 active:scale-[0.98]"
                onClick={() => setDecision(campaign.id, "approve")}
              >
                อนุมัติ
              </button>
              <button
                type="button"
                className="min-h-12 rounded-xl border border-amber-200 bg-amber-50 text-sm font-black text-amber-800 active:scale-[0.98]"
                onClick={() => setDecision(campaign.id, "watch")}
              >
                เฝ้าดู
              </button>
              <button
                type="button"
                className="min-h-12 rounded-xl border border-rose-200 bg-rose-50 text-sm font-black text-rose-800 active:scale-[0.98]"
                onClick={() => setDecision(campaign.id, "reject")}
              >
                ปฏิเสธ
              </button>
              <Link
                href={`/app/campaigns/${campaign.id}`}
                className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-700 active:scale-[0.98]"
              >
                รายละเอียด
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
