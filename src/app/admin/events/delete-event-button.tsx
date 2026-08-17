"use client";

// 이벤트 삭제 버튼 — 파괴적 액션이라 confirm 확인 후 DELETE 호출, 성공 시 목록 새로고침.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BilingualInline } from "@/components/bilingual";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      "本当に削除しますか？この操作は元に戻せません。\n정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    setError(null);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "이벤트 삭제에 실패했습니다.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류로 이벤트 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="イベント削除 / 이벤트 삭제"
        className="inline-flex items-center justify-center rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
      >
        {isDeleting ? (
          <BilingualInline jp="削除中..." kr="삭제 중..." />
        ) : (
          <BilingualInline jp="削除" kr="삭제" />
        )}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
