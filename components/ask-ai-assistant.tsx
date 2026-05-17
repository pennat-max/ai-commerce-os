"use client";

import { useMemo, useState } from "react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";

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
    <div className="grid gap-4">
      <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <Bot size={25} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              Ask AI
            </p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">
              ถามผู้ช่วย AI เรื่องร้านวันนี้
            </h2>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
              คำตอบนี้เป็น mock จากข้อมูลสินค้า แคมเปญ และสูตรกำไรในระบบ ยังไม่เรียก AI API จริง
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-700" />
          <h3 className="text-base font-black text-slate-950">คำถามด่วน</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {questions.map((question) => (
            <button
              key={question.id}
              className={`min-h-12 rounded-xl border px-3 text-left text-sm font-black transition ${
                selectedId === question.id
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
              type="button"
              onClick={() => setSelectedId(question.id)}
            >
              {question.question}
            </button>
          ))}
        </div>
      </section>

      {selectedQuestion ? (
        <section className="grid gap-3">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-emerald-700 p-4 text-white shadow-sm">
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
                <span>AI Commerce Copilot</span>
              </div>

              <AnswerBlock title="เกิดอะไรขึ้น" body={selectedQuestion.answer.what} />
              <AnswerBlock title="ทำไมสำคัญ" body={selectedQuestion.answer.why} />
              <AnswerBlock title="ควรทำอะไรต่อ" body={selectedQuestion.answer.next} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-500 outline-none"
            disabled
            placeholder="พิมพ์เองได้ในเฟสถัดไป"
          />
          <button
            className="flex size-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500"
            disabled
            type="button"
            aria-label="ส่งคำถาม mock"
          >
            <Send size={17} />
          </button>
        </div>
      </section>
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
