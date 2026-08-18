// 신청 내역 CSV 다운로드 버튼 (클라이언트 컴포넌트) — 다운로드 로직만 클라이언트에서 실행, 목록 렌더링은 서버 컴포넌트가 담당
"use client";

import type { Application, ApplicationStatus, ApplyFormField, EventPost } from "@/lib/types";
import { BilingualInline } from "@/components/bilingual";
import { downloadCsv } from "@/lib/csv";

const STATUS_LABEL_KR: Record<ApplicationStatus, string> = {
  pending: "대기중",
  confirmed: "확정",
  attended: "참석완료",
  cancelled: "취소",
};

export default function CsvDownloadButton({
  applications,
  events,
  fields,
}: {
  applications: Application[];
  events: EventPost[];
  fields: ApplyFormField[];
}) {
  function handleDownload() {
    const sortedFields = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
    const fieldKeys = new Set(sortedFields.map((f) => f.fieldKey));
    // message는 동적 폼 도입 이전 레거시 신청 데이터를 위해 계속 보존한다(신규 신청은 대부분 비어있음).
    const header = [
      "이벤트",
      "이름",
      "연락처",
      "상태",
      "신청일시",
      "메시지",
      ...sortedFields.map((f) => f.labelKr || f.labelJp),
      "기타 답변",
    ];
    const body = applications.map((a) => {
      const event = events.find((e) => e.id === a.eventId);
      const fieldColumns = sortedFields.map((f) => a.answers[f.fieldKey] ?? "");
      const orphanColumn = Object.entries(a.answers)
        .filter(([key]) => !fieldKeys.has(key))
        .map(([key, value]) => `${key}:${value}`)
        .join(" / ");
      return [
        event ? event.title : "미지정",
        a.name,
        a.contact ?? "",
        STATUS_LABEL_KR[a.status],
        a.submittedAt,
        a.message ?? "",
        ...fieldColumns,
        orphanColumn,
      ];
    });
    downloadCsv("applications.csv", [header, ...body]);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      aria-label="CSVダウンロード / CSV다운로드"
      className="rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    >
      <BilingualInline jp="CSVダウンロード" kr="CSV다운로드" />
    </button>
  );
}
