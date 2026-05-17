"use client";

import { useMemo, useState } from "react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { PremiumIntro, PremiumPanel, PremiumSection } from "@/components/premium-mobile";

export type AssistantAnswer = {
  what: string;
  why: string;
  next: string;
  tone: "green" | "yellow" | "red" | "blue";
};

export type QuickQuestion = {
  id: string;
  question: string;
  answer: AssistantAnswer;
};

const toneClass: Record<AssistantAnswer["tone"], string> = {
  green: "border-emerald-100 bg-emerald-50 text-emerald-950",
  yellow: "border-amber-100 bg-amber-50 text-amber-950",
  red: "border-rose-100 bg-rose-50 text-rose-950",
  blue: "border-sky-100 bg-sky-50 text-sky-950",
};

export function AskAiAssistant({ questions }: { questions: QuickQuestion[] }) {
  const [selectedId, setSelectedId] = useState(questions[0]?.id ?? "");
  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedId) ?? questions[0],
    [questions, selectedId],
  );

  return (
    <div className="grid gap-5">
      <PremiumIntro
        eyebrow="ถามผู้ช่วย AI"
        title="ถามเรื่องร้านวันนี้"
        description="เลือกคำถามด่วนเพื่อดูคำตอบจากข้อมูลสินค้า แคมเปญ และสูตรกำไรในระบบ"
        icon={Bot}
        tone="violet"
      />

      <PremiumSection
        title="คำถามด่วน"
        helper="เลือกคำถามที่เจ้าของร้านมักอยากรู้ก่อนตัดสินใจ"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {questions.map((question) => (
            <button
              key={question.id}
              className={`min-h-16 rounded-2xl border px-4 text-left text-sm font-black leading-6 shadow-sm transition active:scale-[0.99] ${
                selectedId === question.id
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-white bg-white/85 text-slate-700"
              }`}
              type="button"
              onClick={() => setSelectedId(question.id)}
            >
              <Sparkles size={15} className="mb-2" />
              {question.question}
            </button>
          ))}
        </div>
      </PremiumSection>

      {selectedQuestion ? (
        <section className="grid gap-3">
          <div className="flex justify-end">
            <div className="max-w-[90%] rounded-2xl rounded-br-md bg-emerald-700 p-4 text-white shadow-sm">
              <div className="mb-2 flex items-center justify-end gap-2 text-xs font-black text-emerald-50">
                <span>คุณถาม</span>
                <UserRound size={15} />
              </div>
              <p className="text-sm font-bold leading-6">{selectedQuestion.question}</p>
            </div>
          </div>

          <div className="flex justify-start">
            <div className={`max-w-[92%] rounded-2xl rounded-bl-md border p-4 shadow-sm ${toneClass[selectedQuestion.answer.tone]}`}>
              <div className="mb-3 flex items-center gap-2 text-xs font-black">
                <Bot size={16} />
                <span>ผู้ช่วย AI ร้านค้า</span>
              </div>

              <AnswerBlock title="เกิดอะไรขึ้น" body={selectedQuestion.answer.what} />
              <AnswerBlock title="ทำไมสำคัญ" body={selectedQuestion.answer.why} />
              <AnswerBlock title="ควรทำอะไรต่อ" body={selectedQuestion.answer.next} />
            </div>
          </div>
        </section>
      ) : null}

      <PremiumPanel tone="slate" className="p-3">
        <div className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-500 outline-none"
            disabled
            placeholder="ตอนนี้เลือกคำถามด่วนด้านบน"
          />
          <button
            className="flex size-11 items-center justify-center rounded-xl bg-slate-200 text-slate-500"
            disabled
            type="button"
            aria-label="ส่งคำถามตัวอย่าง"
          >
            <Send size={17} />
          </button>
        </div>
      </PremiumPanel>
    </div>
  );
}

function AnswerBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-black/5 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <p className="text-xs font-black opacity-70">{title}</p>
      <p className="mt-1 text-sm font-bold leading-6">{body}</p>
    </div>
  );
}
