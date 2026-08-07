// 공개 설문 참여 폼 — 제출 성공 시 같은 화면에서 감사 메시지로 전환
"use client";

import { useState, type FormEvent } from "react";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { DecorativeBackground } from "@/components/decorative-background";

const LEVEL_OPTIONS = [
  { jp: "初級", kr: "초급" },
  { jp: "中級", kr: "중급" },
  { jp: "上級", kr: "상급" },
  { jp: "ネイティブ", kr: "원어민" },
];

export default function SurveyPage() {
  const [participantName, setParticipantName] = useState("");
  const [contact, setContact] = useState("");
  const [japaneseLevel, setJapaneseLevel] = useState("");
  const [koreanLevel, setKoreanLevel] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const answers: Record<string, string> = {};
    if (japaneseLevel) answers["일본어_수준"] = japaneseLevel;
    if (koreanLevel) answers["한국어_수준"] = koreanLevel;
    if (purpose.trim()) answers["참가_목적"] = purpose.trim();
    if (message.trim()) answers["하고싶은말"] = message.trim();

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: participantName.trim(),
          contact: contact.trim() || undefined,
          answers,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "送信中にエラーが発生しました。");
      }

      setStatus("done");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "送信中にエラーが発生しました。");
    }
  }

  if (status === "done") {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-amber-50 px-6 py-16 text-center dark:bg-zinc-950">
        <DecorativeBackground />
        <div className="relative z-10 flex flex-col items-center">
          <Bilingual
            as="h1"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
            krClassName="mt-1 text-sm font-normal text-zinc-500 dark:text-zinc-400"
            jp="送信しました。ありがとうございます。"
            kr="설문이 제출되었습니다. 감사합니다!"
          />
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            貴重なご回答ありがとうございます。次回の交流会でお会いしましょう。
            <br />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              소중한 답변 감사드립니다. 다음 모임에서 만나요.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-amber-50 px-6 py-16 dark:bg-zinc-950">
      <DecorativeBackground />
      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <Bilingual
            as="h1"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
            krClassName="mt-1 text-sm font-normal text-zinc-500 dark:text-zinc-400"
            jp="アンケート参加"
            kr="설문 참여"
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            日韓交流会の参加者アンケートです。気軽にお答えください。
            <br />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              일한교류회 참가자 설문입니다. 편하게 답변해주세요.
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="participantName" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">
                お名前 <span className="text-red-500">*</span>
              </span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">이름</span>
            </label>
            <input
              id="participantName"
              name="participantName"
              type="text"
              required
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="山田太郎"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">連絡先（メール・Instagram IDなど、任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                연락처 (이메일 또는 인스타 아이디, 선택)
              </span>
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="example@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">日本語レベル（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">일본어 수준 (선택)</span>
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="日本語レベル選択 / 일본어 수준 선택">
              {LEVEL_OPTIONS.map((level) => (
                <button
                  key={level.kr}
                  type="button"
                  aria-pressed={japaneseLevel === level.kr}
                  onClick={() => setJapaneseLevel(japaneseLevel === level.kr ? "" : level.kr)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    japaneseLevel === level.kr
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  <BilingualInline jp={level.jp} kr={level.kr} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">韓国語レベル（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">한국어 수준 (선택)</span>
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="韓国語レベル選択 / 한국어 수준 선택">
              {LEVEL_OPTIONS.map((level) => (
                <button
                  key={level.kr}
                  type="button"
                  aria-pressed={koreanLevel === level.kr}
                  onClick={() => setKoreanLevel(koreanLevel === level.kr ? "" : level.kr)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    koreanLevel === level.kr
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  <BilingualInline jp={level.jp} kr={level.kr} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="purpose" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">参加目的（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">참가 목적 (선택)</span>
            </label>
            <input
              id="purpose"
              name="purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="例: 言語交換、友達作り"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">メッセージ・ひとこと（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">하고 싶은 말 (선택)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="自由にご記入ください"
            />
          </div>

          {status === "error" && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              <span className="block">{errorMessage}</span>
              <span className="block text-xs opacity-80">제출 중 오류가 발생했습니다.</span>
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            aria-label="アンケートを送信する / 설문 제출하기"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? (
              <BilingualInline jp="送信中..." kr="제출 중..." />
            ) : (
              <BilingualInline jp="送信する" kr="제출하기" />
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
