"use client";

// 홈 화면 "Staff 소개" 버튼 + 팝업 — 팝업 안에서 관리자가 그 자리에서 바로
// 스태프를 추가/수정/삭제/드래그 순서변경할 수 있다(apply-form.tsx와 동일한 패턴).
import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { Modal } from "@/components/modal";
import { resizeImageFile, uploadImage } from "@/lib/image-utils";
import type { StaffMember } from "@/lib/types";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

function StaffMemberForm({
  editingMember,
  onDone,
}: {
  editingMember?: StaffMember;
  onDone: () => void;
}) {
  const router = useRouter();
  const isEditMode = Boolean(editingMember);
  const [name, setName] = useState(editingMember?.name ?? "");
  const [bio, setBio] = useState(editingMember?.bio ?? "");
  const [imageUrl, setImageUrl] = useState(editingMember?.imageUrl ?? "");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
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
    setIsProcessingImage(true);
    try {
      const { blob, previewUrl } = await resizeImageFile(file);
      setImageUrl("");
      setImageBlob(blob);
      setImagePreviewUrl(previewUrl);
    } catch {
      setError("이미지를 처리하는 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalImageUrl = imageBlob ? await uploadImage(imageBlob) : imageUrl;
      const res = await fetch(isEditMode ? `/api/staff/${editingMember!.id}` : "/api/staff", {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditMode
            ? { name: trimmedName, bio: bio.trim(), imageUrl: finalImageUrl || null }
            : { name: trimmedName, bio: bio.trim() || undefined, imageUrl: finalImageUrl || undefined }
        ),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? (isEditMode ? "수정에 실패했습니다." : "추가에 실패했습니다."));
        return;
      }
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="お名前" kr="이름" />
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="写真（任意）" kr="사진 (선택)" />
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm text-zinc-700 file:mr-3 file:rounded-full file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-800 dark:text-zinc-300 dark:file:bg-amber-900/40 dark:file:text-amber-300"
        />
        {isProcessingImage && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            <BilingualInline jp="画像を処理中..." kr="이미지 처리 중..." />
          </p>
        )}
        {(imagePreviewUrl || imageUrl) && !isProcessingImage && (
          <img
            src={imagePreviewUrl || imageUrl}
            alt="プレビュー / 미리보기"
            className="aspect-[4/3] w-40 rounded-lg object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <BilingualInline jp="自己紹介（任意）" kr="자기소개 (선택)" />
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting || isProcessingImage}
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            isEditMode ? <BilingualInline jp="更新中..." kr="수정 중..." /> : <BilingualInline jp="追加中..." kr="추가 중..." />
          ) : isEditMode ? (
            <BilingualInline jp="更新する" kr="수정하기" />
          ) : (
            <BilingualInline jp="追加する" kr="추가하기" />
          )}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <BilingualInline jp="キャンセル" kr="취소" />
        </button>
      </div>
    </form>
  );
}

export default function HomeStaffSection({
  staffMembers,
  isAdmin,
}: {
  staffMembers: StaffMember[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [sortedMembers, setSortedMembers] = useState(() =>
    [...staffMembers].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  useEffect(() => {
    setSortedMembers([...staffMembers].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [staffMembers]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  // 방문자에게는 스태프가 하나도 없으면 버튼 자체를 굳이 보여줄 필요 없다.
  if (!isAdmin && staffMembers.length === 0) return null;

  function handleDragStart(id: string) {
    setDragId(id);
    setOverId(id);
  }

  // dragover는 같은 요소 위에 머무는 동안에도 계속 반복 발생한다. 여기서 배열을 매번
  // 재배열하면 드래그 도중 DOM이 계속 움직여 커서 아래 요소가 바뀌고, 그게 다시 dragover를
  // 유발해 무한히 재배열되는 피드백 루프가 생긴다 — 그래서 hover 대상만 추적하고, 실제 배열
  // 재배열은 drop 시점에 한 번만 한다.
  function handleDragOver(event: DragEvent<HTMLLIElement>, targetId: string) {
    event.preventDefault();
    if (!dragId || dragId === targetId) return;
    if (overId !== targetId) setOverId(targetId);
  }

  async function handleDrop(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    const fromId = dragId;
    const toId = overId;
    setDragId(null);
    setOverId(null);
    if (!fromId || !toId || fromId === toId) return;

    const reordered = (() => {
      const fromIndex = sortedMembers.findIndex((item) => item.id === fromId);
      const toIndex = sortedMembers.findIndex((item) => item.id === toId);
      if (fromIndex === -1 || toIndex === -1) return sortedMembers;
      const next = [...sortedMembers];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    })();
    setSortedMembers(reordered);

    setAdminError(null);
    setIsSavingOrder(true);
    try {
      const res = await fetch("/api/staff/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((m) => m.id) }),
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
      setIsSavingOrder(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "本当に削除しますか？この操作は元に戻せません。\n정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;
    setAdminError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "삭제에 실패했습니다.");
      }
      router.refresh();
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "네트워크 오류로 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
      >
        <BilingualInline jp="Staff紹介" kr="Staff 소개" />
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={
          <Bilingual
            as="h2"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            krClassName="text-xs font-normal text-zinc-500 dark:text-zinc-400"
            jp="Staff紹介"
            kr="Staff 소개"
          />
        }
      >
        <div className="flex flex-col gap-3">
          {isAdmin && (
            <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
              <BilingualInline
                jp="管理者モード：ドラッグして並び替え、編集・削除・追加ができます。"
                kr="관리자 모드: 드래그해서 순서를 바꾸고, 편집·삭제·추가할 수 있습니다."
              />
              {adminError && <p className="mt-1 text-red-600 dark:text-red-400">{adminError}</p>}
              {isSavingOrder && (
                <p className="mt-1 opacity-80">
                  <BilingualInline jp="並び順を保存中..." kr="순서 저장 중..." />
                </p>
              )}
            </div>
          )}

          {sortedMembers.length === 0 && !isAdmin && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <BilingualInline jp="紹介はまだありません。" kr="아직 등록된 소개가 없습니다." />
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {sortedMembers.map((member) => {
              if (isAdmin && editingId === member.id) {
                return (
                  <li key={member.id}>
                    <StaffMemberForm editingMember={member} onDone={() => setEditingId(null)} />
                  </li>
                );
              }

              const card = (
                <div className="flex flex-col gap-2">
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-amber-100 text-4xl dark:bg-zinc-800">
                      🦆
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{member.name}</p>
                    {member.bio && (
                      <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">{member.bio}</p>
                    )}
                  </div>
                </div>
              );

              if (!isAdmin) {
                return (
                  <li
                    key={member.id}
                    className="rounded-xl border border-amber-100 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {card}
                  </li>
                );
              }

              return (
                <li
                  key={member.id}
                  draggable
                  onDragStart={() => handleDragStart(member.id)}
                  onDragOver={(e) => handleDragOver(e, member.id)}
                  onDrop={handleDrop}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  className={`flex flex-col gap-2 rounded-xl border-2 border-dashed p-3 transition-opacity ${
                    dragId === member.id
                      ? "border-transparent opacity-50"
                      : overId === member.id
                        ? "border-amber-400"
                        : "border-transparent hover:border-amber-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                    <span aria-hidden className="cursor-grab select-none text-zinc-400">
                      ⠿
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingId(member.id)}
                        className="rounded-full border border-zinc-300 px-2 py-0.5 font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <BilingualInline jp="編集" kr="수정" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                        className="rounded-full border border-red-300 px-2 py-0.5 font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        {deletingId === member.id ? (
                          <BilingualInline jp="削除中..." kr="삭제 중..." />
                        ) : (
                          <BilingualInline jp="削除" kr="삭제" />
                        )}
                      </button>
                    </div>
                  </div>
                  {card}
                </li>
              );
            })}
          </ul>

          {isAdmin &&
            (isAdding ? (
              <StaffMemberForm onDone={() => setIsAdding(false)} />
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-fit rounded-full border border-amber-300 px-4 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
              >
                <BilingualInline jp="+ Staffを追加" kr="+ Staff 추가" />
              </button>
            ))}
        </div>
      </Modal>
    </>
  );
}
