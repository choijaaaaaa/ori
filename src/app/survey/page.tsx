// 공개 설문 참여 폼 — 제출 성공 시 같은 화면에서 감사 메시지로 전환
"use client";

import { useState, type FormEvent } from "react";

const LEVEL_OPTIONS = ["초급", "중급", "상급", "원어민"];

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
        throw new Error(data?.error?.message ?? "제출 중 오류가 발생했습니다.");
      }

      setStatus("done");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "제출 중 오류가 발생했습니다.");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-amber-50 px-6 py-16 text-center dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          설문이 제출되었습니다. 감사합니다!
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          소중한 답변 감사드립니다. 다음 모임에서 만나요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-amber-50 px-6 py-16 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">설문 참여</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            한일교류회 참가자 설문입니다. 편하게 답변해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="participantName" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="participantName"
              name="participantName"
              type="text"
              required
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="홍길동"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              연락처 (이메일 또는 인스타 아이디, 선택)
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
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">일본어 수준 (선택)</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="일본어 수준 선택">
              {LEVEL_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={japaneseLevel === level}
                  onClick={() => setJapaneseLevel(japaneseLevel === level ? "" : level)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    japaneseLevel === level
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">한국어 수준 (선택)</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="한국어 수준 선택">
              {LEVEL_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={koreanLevel === level}
                  onClick={() => setKoreanLevel(koreanLevel === level ? "" : level)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    koreanLevel === level
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="purpose" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              참가 목적 (선택)
            </label>
            <input
              id="purpose"
              name="purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="예: 언어교환, 친구만들기"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              하고 싶은 말 (선택)
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="자유롭게 남겨주세요"
            />
          </div>

          {status === "error" && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            aria-label="설문 제출하기"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "제출 중..." : "제출하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
