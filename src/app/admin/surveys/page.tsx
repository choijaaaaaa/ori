// 관리자 전용 설문 응답 목록 — 참가자별 상세로 연결
import Link from "next/link";
import { repository } from "@/lib/repository";
import type { SurveyResponse } from "@/lib/types";
import { Bilingual, BilingualInline } from "@/components/bilingual";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(mock 단계 fs 읽기 특성상 필수).
export const dynamic = "force-dynamic";

async function loadResponses(): Promise<
  | { ok: true; responses: SurveyResponse[] }
  | { ok: false }
> {
  try {
    const responses = await repository.listSurveyResponses();
    return { ok: true, responses };
  } catch (error) {
    console.error("설문 응답 목록 로드 실패", error);
    return { ok: false };
  }
}

function summarizeAnswers(answers: Record<string, string>): string {
  const entries = Object.entries(answers);
  if (entries.length === 0) return "-";
  return entries.map(([key, value]) => `${key}: ${value}`).join(" · ");
}

export default async function AdminSurveysPage() {
  const data = await loadResponses();

  return (
    <div className="flex flex-col gap-6">
      <Bilingual
        as="h1"
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
        jp="アンケート一覧"
        kr="설문 응답 목록"
      />

      {!data.ok && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          アンケート回答の読み込み中に問題が発生しました。しばらくしてから再度お試しください。
          <span className="block text-xs opacity-80">
            설문 응답을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </span>
        </p>
      )}

      {data.ok && data.responses.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          まだ送信されたアンケート回答はありません。
          <span className="block text-xs opacity-80">아직 제출된 설문 응답이 없습니다.</span>
        </p>
      )}

      {data.ok && data.responses.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.responses.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/admin/participants/${encodeURIComponent(r.participantName)}`}
                  className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                  aria-label={`${r.participantName} — お名前 / 이름`}
                >
                  {r.participantName}
                </Link>
                <time dateTime={r.submittedAt} className="text-xs text-zinc-400">
                  <BilingualInline jp="送信日" kr="제출일" />:{" "}
                  {new Date(r.submittedAt).toLocaleString("ko-KR")}
                </time>
              </div>
              {r.contact && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <BilingualInline jp="連絡先" kr="연락처" />: {r.contact}
                </p>
              )}
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                <BilingualInline jp="回答" kr="답변" />: {summarizeAnswers(r.answers)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
