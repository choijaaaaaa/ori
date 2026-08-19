"use client";

// 이벤트(교류회 회차) 작성/수정 폼 — editingEvent가 있으면 수정 모드(PATCH), 없으면 생성 모드(POST).
// 제출 성공 시 router.refresh()로 목록 갱신 + onDone 콜백 호출(부모가 인라인 폼을 접는 데 사용).
import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BilingualInline } from "@/components/bilingual";
import { resizeImageFile, uploadImage } from "@/lib/image-utils";
import type { EventPost, Photo } from "@/lib/types";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export default function EventForm({
  photos,
  editingEvent,
  onDone,
  recentVenueMapUrl,
  recentVenueImageUrl,
  recentVenueInfo,
}: {
  photos: Photo[];
  editingEvent?: EventPost;
  onDone?: () => void;
  recentVenueMapUrl?: string; // 같은 장소를 계속 쓰는 경우가 많아 직전 회차 지도 링크를 빠르게 불러올 수 있게
  recentVenueImageUrl?: string; // 직전 회차에 올렸던 오시는 길 이미지를 재사용할 수 있게
  recentVenueInfo?: string; // 장소가 매번 바뀌어도 직전 회차 안내문을 불러와 빠르게 고쳐 쓸 수 있게
}) {
  const router = useRouter();
  const isEditMode = Boolean(editingEvent);
  // 같은 페이지에 생성 폼과 수정 폼이 동시에 렌더링될 수 있어 인스턴스별로 고유한 필드 id가 필요하다.
  const uid = useId();
  const [title, setTitle] = useState(editingEvent?.title ?? "");
  const [content, setContent] = useState(editingEvent?.content ?? "");
  const [eventDate, setEventDate] = useState(editingEvent?.eventDate ?? "");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(editingEvent?.coverPhotoUrl ?? ""); // 갤러리에서 고른 기존 사진 URL
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(""); // 새로 업로드할 이미지 미리보기
  const [coverImageBlob, setCoverImageBlob] = useState<Blob | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [venueMapUrl, setVenueMapUrl] = useState(editingEvent?.venueMapUrl ?? "");
  const [venueImageUrl, setVenueImageUrl] = useState(editingEvent?.venueImageUrl ?? ""); // 기존/재사용 이미지 URL
  const [venueImagePreviewUrl, setVenueImagePreviewUrl] = useState(""); // 새로 업로드할 이미지 미리보기
  const [venueImageBlob, setVenueImageBlob] = useState<Blob | null>(null);
  const [isProcessingVenueImage, setIsProcessingVenueImage] = useState(false);
  const [venueInfo, setVenueInfo] = useState(editingEvent?.venueInfo ?? "");
  const [capacity, setCapacity] = useState(
    editingEvent?.capacity != null ? String(editingEvent.capacity) : ""
  );
  const [closed, setClosed] = useState(editingEvent?.closed ?? false);
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

  async function handleVenueImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("파일 용량이 너무 큽니다 (최대 15MB).");
      event.target.value = "";
      return;
    }

    setError(null);
    setIsProcessingVenueImage(true);
    try {
      const { blob, previewUrl } = await resizeImageFile(file);
      setVenueImageUrl("");
      setVenueImageBlob(blob);
      setVenueImagePreviewUrl(previewUrl);
    } catch {
      setError("이미지를 처리하는 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingVenueImage(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const finalCoverUrl = coverImageBlob ? await uploadImage(coverImageBlob) : coverPhotoUrl;
      const finalVenueImageUrl = venueImageBlob ? await uploadImage(venueImageBlob) : venueImageUrl;

      const res = await fetch(
        isEditMode ? `/api/events/${editingEvent!.id}` : "/api/events",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditMode
              ? {
                  // 수정 모드: 폼의 현재 값을 그대로 반영, 비운 선택 필드는 null로 명시해 지운다.
                  title,
                  content,
                  eventDate: eventDate.trim() === "" ? null : eventDate,
                  coverPhotoUrl: finalCoverUrl || null,
                  venueMapUrl: venueMapUrl.trim() === "" ? null : venueMapUrl,
                  venueImageUrl: finalVenueImageUrl || null,
                  venueInfo: venueInfo.trim() === "" ? null : venueInfo,
                  capacity: capacity.trim() === "" ? null : Number(capacity),
                  closed,
                }
              : {
                  title,
                  content,
                  eventDate: eventDate || undefined,
                  coverPhotoUrl: finalCoverUrl || undefined,
                  venueMapUrl: venueMapUrl || undefined,
                  venueImageUrl: finalVenueImageUrl || undefined,
                  venueInfo: venueInfo || undefined,
                  capacity: capacity.trim() === "" ? undefined : Number(capacity),
                  closed,
                }
          ),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.error?.message ?? (isEditMode ? "이벤트 수정에 실패했습니다." : "이벤트 등록에 실패했습니다.")
        );
        return;
      }

      if (!isEditMode) {
        setTitle("");
        setContent("");
        setEventDate("");
        setCoverPhotoUrl("");
        setCoverPreviewUrl("");
        setCoverImageBlob(null);
        setVenueMapUrl("");
        setVenueImageUrl("");
        setVenueImagePreviewUrl("");
        setVenueImageBlob(null);
        setVenueInfo("");
        setCapacity("");
        setClosed(false);
      }
      router.refresh();
      onDone?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? "네트워크 오류로 이벤트 수정에 실패했습니다."
            : "네트워크 오류로 이벤트 등록에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      aria-label={
        isEditMode ? "イベント編集フォーム / 이벤트 수정 폼" : "イベント作成フォーム / 새 이벤트 작성 폼"
      }
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-title`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="タイトル" kr="제목" />
        </label>
        <input
          id={`${uid}-title`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-date`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="開催日（任意）" kr="모임 일자 (선택)" />
        </label>
        <input
          id={`${uid}-date`}
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
          <label htmlFor={`${uid}-cover-file`} className="text-xs text-zinc-500 dark:text-zinc-400">
            <BilingualInline jp="または新しい画像をアップロード" kr="또는 새 이미지 업로드" />
          </label>
          <input
            id={`${uid}-cover-file`}
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
        <label htmlFor={`${uid}-content`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="本文" kr="내용" />
        </label>
        <textarea
          id={`${uid}-content`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`${uid}-venue-map`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="アクセス（地図リンク）" kr="오시는 길 (지도 링크)" />
          </label>
          {recentVenueMapUrl && recentVenueMapUrl !== venueMapUrl && (
            <button
              type="button"
              onClick={() => setVenueMapUrl(recentVenueMapUrl)}
              className="rounded-full border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              <BilingualInline jp="前回のリンクをコピー" kr="이전 회차 링크 복사" />
            </button>
          )}
        </div>
        <input
          id={`${uid}-venue-map`}
          type="url"
          value={venueMapUrl}
          onChange={(e) => setVenueMapUrl(e.target.value)}
          placeholder="https://maps.app.goo.gl/..."
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="text-xs text-zinc-400">
          <BilingualInline
            jp="地図アプリで場所を検索し、「共有」からリンクをコピーして貼り付けてください。"
            kr="지도 앱에서 장소를 검색한 뒤 '공유'에서 링크를 복사해 붙여넣어주세요."
          />
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="アクセス画像（地図の画面キャプチャなど・任意）" kr="오시는 길 이미지 (지도 캡처 등, 선택)" />
          </span>
          {recentVenueImageUrl && recentVenueImageUrl !== venueImageUrl && (
            <button
              type="button"
              onClick={() => {
                setVenueImageBlob(null);
                setVenueImagePreviewUrl("");
                setVenueImageUrl(recentVenueImageUrl);
              }}
              className="rounded-full border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              <BilingualInline jp="前回の画像をコピー" kr="이전 회차 이미지 복사" />
            </button>
          )}
        </div>
        <input
          id={`${uid}-venue-image-file`}
          type="file"
          accept="image/*"
          onChange={handleVenueImageFileChange}
          className="text-sm text-zinc-700 file:mr-3 file:rounded-full file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-800 dark:text-zinc-300 dark:file:bg-amber-900/40 dark:file:text-amber-300"
        />
        {isProcessingVenueImage && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            <BilingualInline jp="画像を処理中..." kr="이미지 처리 중..." />
          </p>
        )}
        {(venueImagePreviewUrl || venueImageUrl) && !isProcessingVenueImage && (
          <img
            src={venueImagePreviewUrl || venueImageUrl}
            alt="プレビュー / 미리보기"
            className="h-24 w-24 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`${uid}-venue`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="アクセス補足（任意）" kr="오시는 길 추가 설명 (선택)" />
          </label>
          {recentVenueInfo && recentVenueInfo !== venueInfo && (
            <button
              type="button"
              onClick={() => setVenueInfo(recentVenueInfo)}
              className="rounded-full border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              <BilingualInline jp="前回の内容をコピー" kr="이전 회차 내용 복사" />
            </button>
          )}
        </div>
        <textarea
          id={`${uid}-venue`}
          value={venueInfo}
          onChange={(e) => setVenueInfo(e.target.value)}
          rows={2}
          placeholder="例: 大阪京橋駅から徒歩5分 / 예: 오사카 교바시역에서 도보 5분"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-capacity`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="定員（任意）" kr="정원 (선택)" />
        </label>
        <input
          id={`${uid}-capacity`}
          type="number"
          min={1}
          step={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="無制限 / 무제한"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id={`${uid}-closed`}
          type="checkbox"
          checked={closed}
          onChange={(e) => setClosed(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-700"
        />
        <label htmlFor={`${uid}-closed`} className="text-sm text-zinc-700 dark:text-zinc-300">
          {isEditMode ? (
            <BilingualInline jp="募集を締め切る" kr="마감 상태로 만들기" />
          ) : (
            <BilingualInline jp="登録時点で募集を締め切る" kr="최초 등록 시 곧바로 마감 상태로 만들기" />
          )}
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-1 flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting || isProcessingImage || isProcessingVenueImage}
          aria-label={isEditMode ? "イベント更新 / 이벤트 수정" : "イベント投稿 / 이벤트 등록"}
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            isEditMode ? (
              <BilingualInline jp="更新中..." kr="수정 중..." />
            ) : (
              <BilingualInline jp="投稿中..." kr="등록 중..." />
            )
          ) : isEditMode ? (
            <BilingualInline jp="更新する" kr="수정하기" />
          ) : (
            <BilingualInline jp="投稿する" kr="이벤트 등록" />
          )}
        </button>
        {isEditMode && onDone && (
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <BilingualInline jp="キャンセル" kr="취소" />
          </button>
        )}
      </div>
    </form>
  );
}
