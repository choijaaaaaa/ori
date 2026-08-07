"use client";

// 사진 추가 폼(URL + 캡션) — 제출 성공 시 router.refresh()로 목록 갱신
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BilingualInline } from "@/components/bilingual";

export default function PhotoForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption: caption || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "사진 등록에 실패했습니다.");
        return;
      }

      setUrl("");
      setCaption("");
      router.refresh();
    } catch {
      setError("네트워크 오류로 사진 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      aria-label="写真追加フォーム / 새 사진 추가 폼"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="photo-url" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="画像URL" kr="사진 URL" />
        </label>
        <input
          id="photo-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="https://..."
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="photo-caption" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="キャプション（任意）" kr="캡션 (선택)" />
        </label>
        <input
          id="photo-caption"
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
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
        aria-label="写真追加 / 사진 추가"
        className="mt-1 inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        {isSubmitting ? (
          <BilingualInline jp="追加中..." kr="추가 중..." />
        ) : (
          <BilingualInline jp="追加する" kr="사진 추가" />
        )}
      </button>
    </form>
  );
}
