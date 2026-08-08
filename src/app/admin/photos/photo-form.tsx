"use client";

// 사진 추가 폼(로컬 이미지 업로드 + 캡션) — 제출 성공 시 router.refresh()로 목록 갱신
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BilingualInline } from "@/components/bilingual";
import { fileToResizedDataUrl } from "@/lib/image-utils";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export default function PhotoForm() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("파일 용량이 너무 큽니다 (최대 15MB).");
      event.target.value = "";
      return;
    }

    setError(null);
    setIsProcessing(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setPreviewUrl(dataUrl);
    } catch {
      setError("이미지를 처리하는 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!previewUrl) {
      setError("사진을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: previewUrl, caption: caption || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "사진 등록에 실패했습니다.");
        return;
      }

      setPreviewUrl("");
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
        <label htmlFor="photo-file" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="画像を選択" kr="이미지 선택" />
        </label>
        <input
          id="photo-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm text-zinc-700 file:mr-3 file:rounded-full file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-800 dark:text-zinc-300 dark:file:bg-amber-900/40 dark:file:text-amber-300"
        />
        {isProcessing && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            <BilingualInline jp="画像を処理中..." kr="이미지 처리 중..." />
          </p>
        )}
        {previewUrl && !isProcessing && (
          <img
            src={previewUrl}
            alt="プレビュー / 미리보기"
            className="mt-1 h-24 w-24 rounded-lg object-cover"
          />
        )}
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
        disabled={isSubmitting || isProcessing}
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
