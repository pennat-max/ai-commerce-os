import type { DecisionStatus } from "@/types/domain";

const statusCopy: Record<DecisionStatus, string> = {
  GOOD: "ดี",
  WARNING: "ระวัง",
  DANGER: "อันตราย",
};

const statusClasses: Record<DecisionStatus, string> = {
  GOOD: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  WARNING: "bg-amber-100 text-amber-800 ring-amber-200",
  DANGER: "bg-rose-100 text-rose-800 ring-rose-200",
};

export function StatusBadge({ status }: { status: DecisionStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClasses[status]}`}>
      {statusCopy[status]}
    </span>
  );
}

export function platformLabel(platform: string) {
  const labels: Record<string, string> = {
    shopee: "Shopee",
    lazada: "Lazada",
    tiktok: "TikTok Shop",
  };

  return labels[platform] ?? platform;
}
