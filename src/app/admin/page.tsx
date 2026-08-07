// 관리자 대시보드 개요 — 설문 응답 요약과 주요 화면 바로가기
import Link from "next/link";
import { repository } from "@/lib/repository";
import type { SurveyResponse } from "@/lib/types";
import { Bilingual, BilingualInline } from "@/components/bilingual";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(mock 단계 fs 읽기 특성상 필수).
export const dynamic = "force-dynamic";

async function loadOverview(): Promise<
  | { ok: true; responses: SurveyResponse[] }
  | { ok: false }
> {
  try {
    const responses = await repository.listSurveyResponses();
    return { ok: true, responses };
  } catch (error) {
    console.error("대시보드 데이터 로드 실패", error);
    return { ok: false };
  }
}

const SHORTCUTS = [
  { href: "/admin/events", jp: "イベント管理", kr: "이벤트관리" },
  { href: "/admin/photos", jp: "写真管理", kr: "사진관리" },
  { href: "/admin/surveys", jp: "アンケート一覧", kr: "설문목록" },
];

export default async function AdminDashboardPage() {
  const data = await loadOverview();

  return (
    <div className="flex flex-col gap-8">
      <Bilingual
        as="h1"
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
        jp="ダッシュボード"
        kr="대시보드"
      />

      {!data.ok && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          データの読み込み中に問題が発生しました。しばらくしてから再度お試しください。 (데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.)
        </p>
      )}

      {data.ok && (
        <>
          <section aria-label="アンケート回答概要 / 설문 응답 요약" className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <BilingualInline jp="総アンケート回答数" kr="전체 설문 응답 수" />
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {data.responses.length}件
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <BilingualInline jp="参加者数（実人数）" kr="고유 참가자 수" />
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {new Set(data.responses.map((r) => r.participantName)).size}名
              </p>
            </div>
          </section>

          <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
            <h2 id="recent-heading" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              <BilingualInline jp="最近の回答" kr="최근 설문 응답" />
            </h2>
            {data.responses.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">まだ提出されたアンケート回答がありません。 (아직 제출된 설문 응답이 없습니다.)</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.responses.slice(0, 5).map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-amber-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <Link
                      href={`/admin/participants/${encodeURIComponent(r.participantName)}`}
                      className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      {r.participantName}
                    </Link>
                    <time dateTime={r.submittedAt} className="text-xs text-zinc-400">
                      {new Date(r.submittedAt).toLocaleDateString("ko-KR")}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section aria-label="ショートカット / 바로가기" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SHORTCUTS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-label={`${s.jp} (${s.kr})`}
            className="rounded-xl border border-amber-100 bg-white px-5 py-4 text-center font-medium text-zinc-800 shadow-sm transition-colors hover:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <BilingualInline jp={s.jp} kr={s.kr} />
          </Link>
        ))}
      </section>
    </div>
  );
}
