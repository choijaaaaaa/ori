"use client";

// 공지사항 작성 폼 — 제출 성공 시 router.refresh()로 목록 갱신
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AnnouncementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "공지 등록에 실패했습니다.");
        return;
      }

      setTitle("");
      setContent("");
      router.refresh();
    } catch {
      setError("네트워크 오류로 공지 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      aria-label="새 공지 작성 폼"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="announcement-title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          제목
        </label>
        <input
          id="announcement-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="announcement-content" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          내용
        </label>
        <textarea
          id="announcement-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-label="공지 등록"
        className="mt-1 inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        {isSubmitting ? "등록 중..." : "공지 등록"}
      </button>
    </form>
  );
}
