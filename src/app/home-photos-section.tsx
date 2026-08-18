"use client";

// 홈 화면 사진 갤러리 — 관리자 로그인 시 그 자리에서 바로 드래그 순서변경/캡션수정/삭제/추가.
// apply-form.tsx의 인라인 편집 패턴(로컬 정렬 state + 네이티브 드래그앤드롭)과 동일한 구조.
import { useEffect, useState, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import PhotoForm from "@/app/admin/photos/photo-form";
import DeletePhotoButton from "@/app/admin/photos/delete-photo-button";
import type { Photo } from "@/lib/types";

// 캡션 인라인 수정 폼 — PhotoForm은 추가 전용이라 별도로 작은 폼을 둔다.
function CaptionEditForm({
  photo,
  onDone,
}: {
  photo: Photo;
  onDone: () => void;
}) {
  const router = useRouter();
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "캡션 수정에 실패했습니다.");
      }
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류로 캡션 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        autoFocus
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
        placeholder="キャプション / 캡션"
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {isSaving ? (
            <BilingualInline jp="保存中..." kr="저장 중..." />
          ) : (
            <BilingualInline jp="保存" kr="저장" />
          )}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <BilingualInline jp="キャンセル" kr="취소" />
        </button>
      </div>
    </form>
  );
}

export default function HomePhotosSection({
  photos,
  isAdmin,
}: {
  photos: Photo[];
  isAdmin: boolean;
}) {
  const router = useRouter();

  // 관리자 모드 전용 상태 — 사진을 그 자리에서 바로 추가/수정/삭제/드래그 순서변경한다.
  const [sortedPhotos, setSortedPhotos] = useState(() =>
    [...photos].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  useEffect(() => {
    setSortedPhotos([...photos].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [photos]);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [dragPhotoId, setDragPhotoId] = useState<string | null>(null);
  const [isSavingPhotoOrder, setIsSavingPhotoOrder] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  function handlePhotoDragStart(id: string) {
    setDragPhotoId(id);
  }

  function handlePhotoDragOver(event: DragEvent<HTMLLIElement>, targetId: string) {
    event.preventDefault();
    if (!dragPhotoId || dragPhotoId === targetId) return;
    setSortedPhotos((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === dragPhotoId);
      const toIndex = prev.findIndex((item) => item.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  async function handlePhotoDrop(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    setDragPhotoId(null);
    setAdminError(null);
    setIsSavingPhotoOrder(true);
    try {
      const res = await fetch("/api/photos/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: sortedPhotos.map((p) => p.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "순서 변경에 실패했습니다.");
      }
      router.refresh();
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "네트워크 오류로 순서 변경에 실패했습니다.");
      router.refresh();
    } finally {
      setIsSavingPhotoOrder(false);
    }
  }

  return (
    <section aria-labelledby="gallery-heading" className="flex flex-col gap-4">
      <Bilingual
        as="h2"
        jp={<span id="gallery-heading" className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">フォトギャラリー</span>}
        kr="사진 갤러리"
      />

      {isAdmin && (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <BilingualInline
            jp="管理者モード：写真をドラッグして並び替え、編集・削除・追加ができます。"
            kr="관리자 모드: 사진을 드래그해서 순서를 바꾸고, 편집·삭제·추가할 수 있습니다."
          />
          {adminError && <p className="mt-1 text-red-600 dark:text-red-400">{adminError}</p>}
          {isSavingPhotoOrder && (
            <p className="mt-1 opacity-80">
              <BilingualInline jp="並び順を保存中..." kr="순서 저장 중..." />
            </p>
          )}
        </div>
      )}

      {sortedPhotos.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <BilingualInline jp="写真はまだありません。" kr="등록된 사진이 없습니다." />
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {sortedPhotos.map((photo) => {
            if (!isAdmin) {
              return (
                <li key={photo.id} className="flex flex-col gap-1">
                  <img
                    src={photo.url}
                    alt={photo.caption ?? "日韓交流会の活動写真 / 일한교류회 활동 사진"}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  {photo.caption && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{photo.caption}</p>
                  )}
                </li>
              );
            }

            return (
              <li
                key={photo.id}
                draggable
                onDragStart={() => handlePhotoDragStart(photo.id)}
                onDragOver={(e) => handlePhotoDragOver(e, photo.id)}
                onDrop={handlePhotoDrop}
                onDragEnd={() => setDragPhotoId(null)}
                className={`flex flex-col gap-1.5 rounded-lg border-2 border-dashed p-2 transition-opacity ${
                  dragPhotoId === photo.id
                    ? "border-amber-400 opacity-50"
                    : "border-transparent hover:border-amber-200"
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.caption ?? "日韓交流会の活動写真 / 일한교류회 활동 사진"}
                  className="aspect-square w-full rounded-lg object-cover"
                />
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span aria-hidden className="cursor-grab select-none text-zinc-400">
                    ⠿
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingPhotoId(photo.id)}
                    className="rounded-full border border-zinc-300 px-2 py-0.5 font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <BilingualInline jp="編集" kr="수정" />
                  </button>
                  <DeletePhotoButton photoId={photo.id} />
                </div>
                {editingPhotoId === photo.id ? (
                  <CaptionEditForm photo={photo} onDone={() => setEditingPhotoId(null)} />
                ) : (
                  photo.caption && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{photo.caption}</p>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isAdmin &&
        (isAddingPhoto ? (
          <PhotoForm />
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingPhoto(true)}
            className="w-fit rounded-full border border-amber-300 px-4 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
          >
            <BilingualInline jp="+ 写真を追加" kr="+ 사진 추가" />
          </button>
        ))}
    </section>
  );
}
