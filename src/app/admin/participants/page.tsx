// 관리자 전용 참가자 전체 목록 — 신청/설문 응답을 이름 기준으로 합쳐 최근 활동순으로 보여준다
import Link from "next/link";
import { repository } from "@/lib/repository";
import type { Application, SurveyResponse } from "@/lib/types";
import { Bilingual, BilingualInline } from "@/components/bilingual";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
export const dynamic = "force-dynamic";

interface ParticipantSummary {
  name: string;
  applicationCount: number;
  surveyCount: number;
  lastActivityAt: string;
}

async function loadParticipants(): Promise<
  { ok: true; participants: ParticipantSummary[] } | { ok: false }
> {
  try {
    const [applications, responses] = await Promise.all([
      repository.listApplications(),
      repository.listSurveyResponses(),
    ]);

    const byName = new Map<string, ParticipantSummary>();

    function touch(name: string, submittedAt: string, kind: "application" | "survey") {
      const existing = byName.get(name);
      if (!existing) {
        byName.set(name, {
          name,
          applicationCount: kind === "application" ? 1 : 0,
          surveyCount: kind === "survey" ? 1 : 0,
          lastActivityAt: submittedAt,
        });
        return;
      }
      if (kind === "application") existing.applicationCount += 1;
      if (kind === "survey") existing.surveyCount += 1;
      if (new Date(submittedAt).getTime() > new Date(existing.lastActivityAt).getTime()) {
        existing.lastActivityAt = submittedAt;
      }
    }

    applications.forEach((a: Application) => touch(a.name, a.submittedAt, "application"));
    responses.forEach((r: SurveyResponse) => touch(r.participantName, r.submittedAt, "survey"));

    const participants = Array.from(byName.values()).sort(
      (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );

    return { ok: true, participants };
  } catch (error) {
    console.error("참가자 목록 로드 실패", error);
    return { ok: false };
  }
}

export default async function AdminParticipantsPage() {
  const data = await loadParticipants();

  return (
    <div className="flex flex-col gap-6">
      <Bilingual
        as="h1"
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
        jp="参加者一覧"
        kr="참가자 목록"
      />

      {!data.ok && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          参加者情報の読み込み中に問題が発生しました。しばらくしてから再度お試しください。
          <span className="block text-xs opacity-80">
            참가자 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </span>
        </p>
      )}

      {data.ok && data.participants.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          まだ参加者がいません。
          <span className="block text-xs opacity-80">아직 참가자가 없습니다.</span>
        </p>
      )}

      {data.ok && data.participants.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.participants.map((p) => (
            <li key={p.name}>
              <Link
                href={`/admin/participants/${encodeURIComponent(p.name)}`}
                aria-label={`${p.name} — 参加者詳細へ / 참가자 상세로 이동`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm transition-colors hover:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{p.name}</span>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    <BilingualInline jp="申込" kr="신청" /> {p.applicationCount}
                  </span>
                  <span>
                    <BilingualInline jp="アンケート" kr="설문" /> {p.surveyCount}
                  </span>
                  <time dateTime={p.lastActivityAt}>
                    {new Date(p.lastActivityAt).toLocaleString("ja-JP")}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
