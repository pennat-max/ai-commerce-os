"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  MessageCircle,
  PackageSearch,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  KpiCard,
  PremiumEmptyState,
  PremiumFeedCard,
  PremiumIntro,
  PremiumSection,
  type PremiumTone,
} from "@/components/premium-mobile";

type InboxStatus = "รอตอบ" | "ตอบแล้ว" | "ต้องอนุมัติ";
type InboxPlatform = "Shopee" | "Lazada" | "TikTok Shop" | "Facebook" | "LINE" | "WhatsApp";

type InboxChat = {
  id: string;
  customerName: string;
  platform: InboxPlatform;
  status: InboxStatus;
  lastMessage: string;
  time: string;
  sku: string;
  productId: string;
  aiReply: string;
};

const chats: InboxChat[] = [
  {
    id: "chat-1",
    customerName: "คุณฝน",
    platform: "Shopee",
    status: "รอตอบ",
    lastMessage: "ถ้าสั่งวันนี้ ส่งออกได้เมื่อไหร่คะ",
    time: "09:42",
    sku: "HOME-LED-01",
    productId: "30000000-0000-0000-0000-000000000001",
    aiReply: "สวัสดีค่ะ สินค้าพร้อมส่ง หากชำระวันนี้ร้านจัดส่งภายในรอบถัดไปค่ะ",
  },
  {
    id: "chat-2",
    customerName: "คุณแทน",
    platform: "LINE",
    status: "ต้องอนุมัติ",
    lastMessage: "ลดเพิ่มได้ไหม ถ้าซื้อ 3 ชิ้น",
    time: "10:15",
    sku: "HOME-BOX-02",
    productId: "30000000-0000-0000-0000-000000000002",
    aiReply: "แนะนำให้อนุมัติส่วนลดไม่เกิน 10 บาทต่อชิ้น เพื่อให้กำไรยังผ่านขั้นต่ำค่ะ",
  },
  {
    id: "chat-3",
    customerName: "คุณเมย์",
    platform: "TikTok Shop",
    status: "รอตอบ",
    lastMessage: "ใช้กับพื้นกระเบื้องได้ไหม",
    time: "11:03",
    sku: "HOME-MOP-03",
    productId: "30000000-0000-0000-0000-000000000003",
    aiReply: "ใช้ได้ค่ะ เหมาะกับพื้นกระเบื้องและพื้นเรียบ แนะนำบิดผ้าให้หมาดก่อนใช้งานค่ะ",
  },
  {
    id: "chat-4",
    customerName: "คุณบี",
    platform: "Facebook",
    status: "ตอบแล้ว",
    lastMessage: "ขอเลขพัสดุหน่อยค่ะ",
    time: "12:20",
    sku: "HOME-RACK-04",
    productId: "30000000-0000-0000-0000-000000000004",
    aiReply: "ส่งเลขพัสดุให้ลูกค้าแล้ว และตั้งแจ้งเตือนติดตามสถานะจัดส่งในหน้าร้านค่ะ",
  },
  {
    id: "chat-5",
    customerName: "คุณก้อง",
    platform: "Lazada",
    status: "ต้องอนุมัติ",
    lastMessage: "ขอเปลี่ยนที่อยู่หลังสั่งซื้อได้ไหมครับ",
    time: "13:08",
    sku: "HOME-LED-01",
    productId: "30000000-0000-0000-0000-000000000001",
    aiReply: "ควรขออนุมัติก่อนตอบ เพราะอาจต้องยกเลิกคำสั่งซื้อเดิมตามเงื่อนไขแพลตฟอร์มค่ะ",
  },
  {
    id: "chat-6",
    customerName: "คุณแอน",
    platform: "WhatsApp",
    status: "รอตอบ",
    lastMessage: "มีเก็บเงินปลายทางไหม",
    time: "14:31",
    sku: "HOME-BOX-02",
    productId: "30000000-0000-0000-0000-000000000002",
    aiReply: "มีบริการเก็บเงินปลายทางค่ะ ลูกค้าสามารถเลือกช่องทางนี้ตอนชำระเงินได้เลยค่ะ",
  },
];

const statusFilters: Array<InboxStatus | "ทั้งหมด"> = ["ทั้งหมด", "รอตอบ", "ตอบแล้ว", "ต้องอนุมัติ"];

const platformClass: Record<InboxPlatform, string> = {
  Shopee: "bg-orange-50 text-orange-700 ring-orange-100",
  Lazada: "bg-violet-50 text-violet-700 ring-violet-100",
  "TikTok Shop": "bg-slate-900 text-white ring-slate-200",
  Facebook: "bg-blue-50 text-blue-700 ring-blue-100",
  LINE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  WhatsApp: "bg-lime-50 text-lime-700 ring-lime-100",
};

const statusClass: Record<InboxStatus, string> = {
  "รอตอบ": "bg-amber-50 text-amber-800 ring-amber-100",
  "ตอบแล้ว": "bg-emerald-50 text-emerald-800 ring-emerald-100",
  "ต้องอนุมัติ": "bg-rose-50 text-rose-800 ring-rose-100",
};

const statusTone: Record<InboxStatus, PremiumTone> = {
  "รอตอบ": "amber",
  "ตอบแล้ว": "emerald",
  "ต้องอนุมัติ": "rose",
};

function statusIcon(status: InboxStatus) {
  if (status === "ตอบแล้ว") return <CheckCircle2 size={15} />;
  if (status === "ต้องอนุมัติ") return <ShieldCheck size={15} />;
  return <Clock3 size={15} />;
}

export function UnifiedInbox() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InboxStatus | "ทั้งหมด">("ทั้งหมด");
  const [notice, setNotice] = useState<string | null>(null);

  const filteredChats = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return chats.filter((chat) => {
      const matchesStatus = status === "ทั้งหมด" || chat.status === status;
      const matchesQuery =
        keyword.length === 0 ||
        [chat.customerName, chat.platform, chat.lastMessage, chat.sku]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const waitingCount = chats.filter((chat) => chat.status === "รอตอบ").length;
  const approvalCount = chats.filter((chat) => chat.status === "ต้องอนุมัติ").length;

  return (
    <div className="grid gap-5">
      <PremiumIntro
        eyebrow="กล่องแชทรวม"
        title="รวมแชททุกช่องทางไว้ที่เดียว"
        description={`วันนี้มีแชทรอตอบ ${waitingCount} รายการ และข้อความที่ควรขออนุมัติ ${approvalCount} รายการ`}
        icon={MessageCircle}
        tone="sky"
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <KpiCard label="รอตอบ" value={`${waitingCount}`} helper="ควรตอบไว" icon={Clock3} tone="amber" />
          <KpiCard label="ขออนุมัติ" value={`${approvalCount}`} helper="ให้เจ้าของร้านดู" icon={ShieldCheck} tone="rose" />
          <KpiCard label="ตอบแล้ว" value={`${chats.filter((chat) => chat.status === "ตอบแล้ว").length}`} helper="ปิดงานแล้ว" icon={CheckCircle2} tone="emerald" />
        </div>

        <label className="mt-4 flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <Search size={18} className="shrink-0 text-slate-500" />
          <input
            className="h-11 min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="ค้นหาชื่อลูกค้า ช่องทาง หรือรหัสสินค้า"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {statusFilters.map((item) => (
            <button
              key={item}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-black ring-1 ${
                status === item
                  ? "bg-emerald-700 text-white ring-emerald-700"
                  : "bg-white text-slate-600 ring-slate-200"
              }`}
              type="button"
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </PremiumIntro>

      <PremiumSection title="ข้อความล่าสุด" helper="เลือกส่งคำตอบ ขออนุมัติ หรือเปิดดูสินค้าที่เกี่ยวข้อง">
        {notice ? (
          <div
            className="mb-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800 shadow-sm"
            role="status"
          >
            {notice}
          </div>
        ) : null}

        {filteredChats.map((chat) => (
          <PremiumFeedCard
            key={chat.id}
            icon={MessageCircle}
            title={chat.customerName}
            description={`${chat.time} · ${chat.platform} · รหัสสินค้า ${chat.sku}`}
            tone={statusTone[chat.status]}
            badge={
              <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${statusClass[chat.status]}`}>
                {statusIcon(chat.status)}
                {chat.status}
              </span>
            }
          >
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${platformClass[chat.platform]}`}>
                {chat.platform}
              </span>
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-black text-slate-500 ring-1 ring-slate-100">
                รหัสสินค้า {chat.sku}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm">
              <p className="text-xs font-black text-slate-500">ข้อความล่าสุด</p>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-800">{chat.lastMessage}</p>
            </div>

            <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 shadow-sm">
              <p className="text-xs font-black text-emerald-700">AI แนะนำคำตอบ</p>
              <p className="mt-1 text-sm font-bold leading-6 text-emerald-950">{chat.aiReply}</p>
            </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-2 text-xs font-black text-white sm:gap-2 sm:px-3 sm:text-sm"
                type="button"
                data-action="mock-send-reply"
                onClick={() => setNotice(`${chat.customerName}: ทำเครื่องหมายว่าส่งคำตอบแล้ว (เดโม)`)}
              >
                <Send size={15} />
                ส่งคำตอบ
              </button>
              <button
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2 text-xs font-black text-amber-800 sm:gap-2 sm:px-3 sm:text-sm"
                type="button"
                data-action="mock-request-approval"
                onClick={() => setNotice(`${chat.customerName}: ส่งเข้าคิวขออนุมัติแล้ว (เดโม)`)}
              >
                <ShieldCheck size={15} />
                ขออนุมัติ
              </button>
              <Link
                href={`/app/products/${chat.productId}`}
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 sm:gap-2 sm:px-3 sm:text-sm"
              >
                <PackageSearch size={15} />
                ดูสินค้า
              </Link>
            </div>
          </PremiumFeedCard>
        ))}

        {filteredChats.length === 0 ? (
          <PremiumEmptyState
            title="ไม่พบแชทที่ตรงกับตัวกรอง"
            description="ลองค้นหาด้วยรหัสสินค้า หรือเลือกสถานะอื่น"
            icon={MessageCircle}
          />
        ) : null}
      </PremiumSection>
    </div>
  );
}
