"use client";

// 이벤트(교류회 회차) 작성 폼 — 제출 성공 시 router.refresh()로 목록 갱신
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BilingualInline } from "@/components/bilingual";
import { resizeImageFile, uploadImage } from "@/lib/image-utils";
import type { Photo } from "@/lib/types";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export default function EventForm({ photos }: { photos: Photo[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(""); // 갤러리에서 고른 기존 사진 URL
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(""); // 새로 업로드할 이미지 미리보기
  const [coverImageBlob, setCoverImageBlob] = useState<Blob | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [venueInfo, setVenueInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectGalleryPhoto(url: string) {
    setCoverImageBlob(null);
    setCoverPreviewUrl("");
    setCoverPhotoUrl(coverPhotoUrl === url ? "" : url);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("파일 용량이 너무 큽니다 (최대 15MB).");
      event.target.value = "";
      return;
    }

    setError(null);
    setIsProcessingImage(true);
    try {
      const { blob, previewUrl } = await resizeImageFile(file);
      setCoverPhotoUrl("");
      setCoverImageBlob(blob);
      setCoverPreviewUrl(previewUrl);
    } catch {
      setError("이미지를 처리하는 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const finalCoverUrl = coverImageBlob ? await uploadImage(coverImageBlob) : coverPhotoUrl;

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          eventDate: eventDate || undefined,
          coverPhotoUrl: finalCoverUrl || undefined,
          venueInfo: venueInfo || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "이벤트 등록에 실패했습니다.");
        return;
      }

      setTitle("");
      setContent("");
      setEventDate("");
      setCoverPhotoUrl("");
      setCoverPreviewUrl("");
      setCoverImageBlob(null);
      setVenueInfo("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류로 이벤트 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      aria-label="イベント作成フォーム / 새 이벤트 작성 폼"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="event-title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="タイトル" kr="제목" />
        </label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="event-date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="開催日（任意）" kr="모임 일자 (선택)" />
        </label>
        <input
          id="event-date"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="カード画像（任意）" kr="대표 사진 (선택)" />
        </span>
        {photos.length > 0 ? (
          <div
            role="group"
            aria-label="ギャラリーから選択 / 갤러리에서 선택"
            className="flex flex-wrap gap-2"
          >
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => selectGalleryPhoto(photo.url)}
                aria-pressed={coverPhotoUrl === photo.url}
                aria-label={photo.caption ?? photo.url}
                className={`overflow-hidden rounded-lg border-2 transition-colors ${
                  coverPhotoUrl === photo.url
                    ? "border-amber-600"
                    : "border-transparent hover:border-amber-300"
                }`}
              >
                <img src={photo.url} alt="" className="h-16 w-16 object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            <BilingualInline
              jp="写真管理でギャラリーに写真を追加すると、ここから選べます。"
              kr="사진 관리에서 갤러리에 사진을 추가하면 여기서 선택할 수 있습니다."
            />
          </p>
        )}
        <div className="flex items-center gap-3">
          <label htmlFor="event-cover-file" className="text-xs text-zinc-500 dark:text-zinc-400">
            <BilingualInline jp="または新しい画像をアップロード" kr="또는 새 이미지 업로드" />
          </label>
          <input
            id="event-cover-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm text-zinc-700 file:mr-3 file:rounded-full file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-800 dark:text-zinc-300 dark:file:bg-amber-900/40 dark:file:text-amber-300"
          />
        </div>
        {isProcessingImage && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            <BilingualInline jp="画像を処理中..." kr="이미지 처리 중..." />
          </p>
        )}
        {(coverPreviewUrl || coverPhotoUrl) && !isProcessingImage && (
          <img
            src={coverPreviewUrl || coverPhotoUrl}
            alt="プレビュー / 미리보기"
            className="h-20 w-20 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="event-content" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="本文" kr="내용" />
        </label>
        <textarea
          id="event-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="event-venue" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="アクセス（任意、この回だけの案内）" kr="오시는 길 (선택, 이 회차 전용 안내)" />
        </label>
        <textarea
          id="event-venue"
          value={venueInfo}
          onChange={(e) => setVenueInfo(e.target.value)}
          rows={3}
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
        disabled={isSubmitting || isProcessingImage}
        aria-label="イベント投稿 / 이벤트 등록"
        className="mt-1 inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        {isSubmitting ? (
          <BilingualInline jp="投稿中..." kr="등록 중..." />
        ) : (
          <BilingualInline jp="投稿する" kr="이벤트 등록" />
        )}
      </button>
    </form>
  );
}
