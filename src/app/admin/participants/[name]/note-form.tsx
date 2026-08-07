// 참가자 메모 추가 폼 (클라이언트 컴포넌트) — 제출 성공 시 상세 페이지 새로고침
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function NoteForm({ participantName }: { participantName: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch("/api/participants/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName, note: note.trim(), tags: tagList }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "메모 저장 중 오류가 발생했습니다.");
      }

      setNote("");
      setTags("");
      setStatus("idle");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "메모 저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          메모
        </label>
        <textarea
          id="note"
          name="note"
          required
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="예: 대화 수준이 높아 상급 그룹에 배치하면 좋음"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tags" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          태그 (쉼표로 구분, 선택)
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="예: 적극적, 상급"
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
        aria-label="메모 저장하기"
        className="inline-flex w-fit items-center justify-center rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "저장 중..." : "메모 저장"}
      </button>
    </form>
  );
}
