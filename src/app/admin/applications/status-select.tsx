// 신청 상태 변경 셀렉트 (클라이언트 컴포넌트) — 변경 성공 시 목록 새로고침
"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import type { ApplicationStatus } from "@/lib/types";

const STATUS_LABELS: Record<ApplicationStatus, { jp: string; kr: string }> = {
  pending: { jp: "保留中", kr: "대기중" },
  confirmed: { jp: "確定", kr: "확정" },
  attended: { jp: "参加済み", kr: "참석완료" },
  cancelled: { jp: "キャンセル", kr: "취소" },
};

const STATUS_OPTIONS: ApplicationStatus[] = ["pending", "confirmed", "attended", "cancelled"];

export default function StatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value as ApplicationStatus;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "상태 변경에 실패했습니다.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isSubmitting}
        aria-label="申し込みステータス変更 / 신청 상태 변경"
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s].jp} ({STATUS_LABELS[s].kr})
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
