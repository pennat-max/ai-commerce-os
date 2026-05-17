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
    aiReply: "ส่งเลขพัสดุให้ลูกค้าแล้ว และตั้งแจ้งเตือนติดตามสถานะจัดส่งใน dashboard ค่ะ",
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

function statusIcon(status: InboxStatus) {
  if (status === "ตอบแล้ว") return <CheckCircle2 size={15} />;
  if (status === "ต้องอนุมัติ") return <ShieldCheck size={15} />;
  return <Clock3 size={15} />;
}

export function UnifiedInbox() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InboxStatus | "ทั้งหมด">("ทั้งหมด");

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
    <div className="grid gap-4">
      <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <MessageCircle size={23} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              Unified Inbox
            </p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">
              รวมแชททุกช่องทางไว้ที่เดียว
            </h2>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
              วันนี้มีแชทรอตอบ {waitingCount} รายการ และต้องขออนุมัติ {approvalCount} รายการ
            </p>
          </div>
        </div>

        <label className="mt-4 flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <Search size={18} className="shrink-0 text-slate-500" />
          <input
            className="h-11 min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="ค้นหาชื่อลูกค้า แพลตฟอร์ม หรือ SKU"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((item) => (
            <button
              key={item}
              className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-black ring-1 ${
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
      </section>

      <section className="grid gap-3">
        {filteredChats.map((chat) => (
          <article key={chat.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-950">{chat.customerName}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${platformClass[chat.platform]}`}>
                    {chat.platform}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {chat.time} · SKU {chat.sku}
                </p>
              </div>
              <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${statusClass[chat.status]}`}>
                {statusIcon(chat.status)}
                {chat.status}
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-black text-slate-500">ข้อความล่าสุด</p>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-800">{chat.lastMessage}</p>
            </div>

            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs font-black text-emerald-700">AI แนะนำคำตอบ</p>
              <p className="mt-1 text-sm font-bold leading-6 text-emerald-950">{chat.aiReply}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-2 text-xs font-black text-white"
                type="button"
              >
                <Send size={15} />
                ส่งคำตอบ
              </button>
              <button
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2 text-xs font-black text-amber-800"
                type="button"
              >
                <ShieldCheck size={15} />
                ขออนุมัติ
              </button>
              <Link
                href={`/app/products/${chat.productId}`}
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-700"
              >
                <PackageSearch size={15} />
                ดูสินค้า
              </Link>
            </div>
          </article>
        ))}

        {filteredChats.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
            <p className="text-base font-black text-slate-900">ไม่พบแชทที่ตรงกับตัวกรอง</p>
            <p className="mt-1 text-sm font-bold text-slate-500">ลองค้นหาด้วย SKU หรือเลือกสถานะอื่น</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
