"use client";

// 참가 신청 폼 — 신청 접수 후 QR 코드를 보여주고, QR을 스캔하면 설문 페이지로 이동한다.
import { useState, type FormEvent } from "react";
import QRCode from "react-qr-code";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { DecorativeBackground } from "@/components/decorative-background";
import type { EventPost } from "@/lib/types";

export default function ApplyForm({
  events,
  activeCountByEventId,
  initialEventId,
}: {
  events: EventPost[];
  activeCountByEventId: Record<string, number>;
  initialEventId?: string;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [eventId, setEventId] = useState(
    initialEventId && events.some((e) => e.id === initialEventId) ? initialEventId : ""
  );
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim() || undefined,
          message: message.trim() || undefined,
          eventId: eventId || undefined,
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
    // 선택한 회차가 있으면 설문도 그 회차 소속으로 이어지도록 eventId를 실어 보낸다.
    const surveyPath = eventId ? `/survey?eventId=${eventId}` : "/survey";
    const surveyUrl =
      typeof window !== "undefined" ? `${window.location.origin}${surveyPath}` : surveyPath;

    return (
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-amber-50 px-6 py-16 text-center dark:bg-zinc-950">
        <DecorativeBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Bilingual
            as="h1"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
            krClassName="mt-1 text-sm font-normal text-zinc-500 dark:text-zinc-400"
            jp="お申し込みを受け付けました。"
            kr="신청이 접수되었습니다."
          />
          <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-300">
            下のQRコードをカメラで読み取ると、アンケートページに移動します。
            <br />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              아래 QR 코드를 카메라로 스캔하면 설문 페이지로 이동합니다.
            </span>
          </p>
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <QRCode value={surveyUrl} size={180} />
          </div>
          <p className="text-xs text-zinc-400">
            <BilingualInline jp="読み取れない場合はこちらをタップ" kr="스캔이 안 되면 여기를 눌러주세요" />
            {" — "}
            <a href={surveyPath} className="underline hover:text-amber-600">
              {surveyUrl}
            </a>
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
            jp="参加申し込み"
            kr="참가 신청"
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            日韓交流会への参加申し込みフォームです。お名前をご記入ください。
            <br />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              일한교류회 참가 신청 폼입니다. 이름을 입력해주세요.
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {events.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="eventId" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                <span className="block">参加希望の回（任意）</span>
                <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  참가 희망 회차 (선택)
                </span>
              </label>
              <select
                id="eventId"
                name="eventId"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">未定・特に希望なし / 미정 · 특별히 없음</option>
                {events.map((event) => {
                  const activeCount = activeCountByEventId[event.id] ?? 0;
                  const isFull =
                    event.closed || (typeof event.capacity === "number" && activeCount >= event.capacity);
                  return (
                    <option key={event.id} value={event.id} disabled={isFull}>
                      {event.eventDate ? `${event.eventDate} — ` : ""}
                      {event.title}
                      {isFull ? " (満席 / 마감)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">
                お名前 <span className="text-red-500">*</span>
              </span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">이름</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <label htmlFor="message" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">申し込み内容・ひとこと（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                신청 내용 / 하고 싶은 말 (선택)
              </span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="参加希望の回や、聞きたいことなど自由にご記入ください"
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
            aria-label="申し込みを送信する / 신청 제출하기"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? (
              <BilingualInline jp="送信中..." kr="제출 중..." />
            ) : (
              <BilingualInline jp="申し込む" kr="신청하기" />
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
