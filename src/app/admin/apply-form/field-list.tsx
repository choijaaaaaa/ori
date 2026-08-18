"use client";

// 등록된 신청 폼 항목 카드 목록 — 네이티브 HTML5 드래그앤드롭으로 순서 변경,
// 카드별 수정(인라인 폼 펼치기)/삭제 버튼 제공.
import { useEffect, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import type { ApplyFormField } from "@/lib/types";
import { BilingualInline } from "@/components/bilingual";
import FieldForm, { getTypeLabel } from "./field-form";

export default function FieldList({ fields }: { fields: ApplyFormField[] }) {
  const router = useRouter();
  const [items, setItems] = useState(fields);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // 서버 컴포넌트가 router.refresh()로 새로 내려준 최신 목록과 로컬 드래그 상태를 동기화한다.
  useEffect(() => {
    setItems(fields);
  }, [fields]);

  function handleDragStart(id: string) {
    setDragId(id);
  }

  // 드래그 중인 카드가 다른 카드 위를 지날 때마다 로컬 배열을 즉시 재배열해 부드러운 드래그 경험을 준다.
  function handleDragOver(event: DragEvent<HTMLLIElement>, targetId: string) {
    event.preventDefault();
    if (!dragId || dragId === targetId) return;
    setItems((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === dragId);
      const toIndex = prev.findIndex((item) => item.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  async function handleDrop(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    setDragId(null);
    setActionError(null);
    setIsSavingOrder(true);
    try {
      const res = await fetch("/api/apply-form-fields/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: items.map((item) => item.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "순서 변경에 실패했습니다.");
      }
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "네트워크 오류로 순서 변경에 실패했습니다.");
      router.refresh(); // 실패 시 서버에 저장된 순서로 되돌린다.
    } finally {
      setIsSavingOrder(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "本当に削除しますか？この操作は元に戻せません。\n정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/apply-form-fields/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "항목 삭제에 실패했습니다.");
      }
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "네트워크 오류로 항목 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {actionError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {actionError}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((item, index) => {
          const isEditing = editingId === item.id;

          if (isEditing) {
            return (
              <li key={item.id}>
                <FieldForm editingField={item} onDone={() => setEditingId(null)} />
              </li>
            );
          }

          const typeLabel = getTypeLabel(item.type);

          return (
            <li
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={handleDrop}
              onDragEnd={() => setDragId(null)}
              className={`flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 transition-opacity dark:border-zinc-800 dark:bg-zinc-900 ${
                dragId === item.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    aria-hidden
                    className="cursor-grab select-none text-zinc-400 dark:text-zinc-600"
                    title="ドラッグして並び替え / 드래그해서 순서 변경"
                  >
                    ⠿
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">{index + 1}</span>
                  <span className="w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <BilingualInline jp={typeLabel.jp} kr={typeLabel.kr} />
                  </span>
                  {item.type !== "image" && item.required && (
                    <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      <BilingualInline jp="必須" kr="필수" />
                    </span>
                  )}
                  {item.type === "checkbox_group" && item.requireAll && (
                    <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      <BilingualInline jp="全項目必須" kr="전체 동의 필수" />
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    aria-label="項目編集 / 항목 수정"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <BilingualInline jp="編集" kr="수정" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    aria-label="項目削除 / 항목 삭제"
                    className="inline-flex items-center justify-center rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    {deletingId === item.id ? (
                      <BilingualInline jp="削除中..." kr="삭제 중..." />
                    ) : (
                      <BilingualInline jp="削除" kr="삭제" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.labelJp}</p>
                {item.labelKr && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.labelKr}</p>
                )}
              </div>

              {(item.helpJp || item.helpKr) && (
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  {item.helpJp && <p>{item.helpJp}</p>}
                  {item.helpKr && <p>{item.helpKr}</p>}
                </div>
              )}

              {item.options.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {item.options.map((opt, i) => (
                    <li
                      key={i}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {opt.kr ? <BilingualInline jp={opt.jp} kr={opt.kr} /> : opt.jp}
                    </li>
                  ))}
                </ul>
              )}

              {item.type === "image" && item.imageUrl && (
                <img src={item.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
              )}
            </li>
          );
        })}
      </ul>

      {isSavingOrder && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          <BilingualInline jp="並び順を保存中..." kr="순서 저장 중..." />
        </p>
      )}
    </div>
  );
}
