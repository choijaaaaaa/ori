// 관리자 전용 설문 응답 목록 — 참가자별 상세로 연결, 이름 검색 지원
import { repository } from "@/lib/repository";
import type { SurveyResponse } from "@/lib/types";
import { Bilingual } from "@/components/bilingual";
import SurveySearchList from "./survey-search-list";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
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

      {data.ok && data.responses.length > 0 && <SurveySearchList responses={data.responses} />}
    </div>
  );
}
