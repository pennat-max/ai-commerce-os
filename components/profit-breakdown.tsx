import { CommerceCard, StatBox } from "@/components/commerce-card";
import { StatusBadge } from "@/components/status";
import { calculateProfit, formatBaht, formatPercent } from "@/lib/profit";
import type { Campaign, Product } from "@/types/domain";

export function ProfitBreakdown({
  product,
  campaign,
}: {
  product: Product;
  campaign?: Campaign;
}) {
  const profit = calculateProfit(product, campaign);
  const rows = [
    ["ราคาขาย", product.sellingPrice, "บวก"],
    ["ต้นทุนสินค้า", -product.cost, "ลบ"],
    ["ค่าธรรมเนียมแพลตฟอร์ม", -profit.platformFee, "ลบ"],
    ["ส่วนลดแคมเปญ", -(campaign?.campaignDiscount ?? 0), "ลบ"],
    ["Voucher ร้าน", -(campaign?.shopVoucher ?? 0), "ลบ"],
    ["Coins / Cashback", -(campaign?.coinsCashback ?? 0), "ลบ"],
    ["ค่า Ads", -product.adsCost, "ลบ"],
    ["Affiliate commission", -profit.affiliateCommission, "ลบ"],
    ["Shipping subsidy", -(campaign?.shippingSubsidy ?? 0), "ลบ"],
    ["Packaging", -product.packagingCost, "ลบ"],
    ["Other cost", -product.otherCost, "ลบ"],
  ] as const;

  return (
    <CommerceCard title="Profit Breakdown">
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <StatBox
          label="Net Profit"
          value={formatBaht(profit.netProfit)}
          tone={profit.netProfit <= 0 ? "red" : "green"}
        />
        <StatBox label="Margin" value={formatPercent(profit.marginPercent)} />
        <StatBox label="Min Profit" value={formatBaht(product.minProfit)} />
        <div className="rounded-lg border border-sky-100 bg-white p-3">
          <p className="text-[11px] font-bold text-slate-400">Decision</p>
          <div className="mt-2">
            <StatusBadge status={profit.status} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-sky-100 bg-white">
        {rows.map(([label, value, direction]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-sky-50 px-3 py-3 last:border-b-0"
          >
            <div>
              <p className="text-sm font-black text-slate-800">{label}</p>
              <p className="text-xs font-bold text-slate-400">{direction}</p>
            </div>
            <p
              className={`text-sm font-black ${
                value < 0 ? "text-rose-600" : "text-emerald-700"
              }`}
            >
              {value < 0 ? "-" : "+"}
              {formatBaht(Math.abs(value))}
            </p>
          </div>
        ))}
      </div>
    </CommerceCard>
  );
}
