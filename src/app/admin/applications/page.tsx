// 관리자 전용 참가 신청 내역 목록
import { repository } from "@/lib/repository";
import type { Application } from "@/lib/types";
import { Bilingual, BilingualInline } from "@/components/bilingual";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(mock 단계 fs 읽기 특성상 필수).
export const dynamic = "force-dynamic";

async function loadApplications(): Promise<
  { ok: true; items: Application[] } | { ok: false }
> {
  try {
    const items = await repository.listApplications();
    return { ok: true, items };
  } catch (error) {
    console.error("신청 내역 로드 실패", error);
    return { ok: false };
  }
}

export default async function AdminApplicationsPage() {
  const data = await loadApplications();

  return (
    <div className="flex flex-col gap-6">
      <Bilingual
        as="h1"
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
        jp="申し込み一覧"
        kr="신청 내역"
      />

      {!data.ok && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          申し込み内容の読み込み中に問題が発生しました。しばらくしてから再度お試しください。
          <span className="block text-xs opacity-80">
            신청 내역을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </span>
        </p>
      )}

      {data.ok && data.items.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          まだ申し込みはありません。
          <span className="block text-xs opacity-80">아직 접수된 신청이 없습니다.</span>
        </p>
      )}

      {data.ok && data.items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.items.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{a.name}</span>
                <time dateTime={a.submittedAt} className="text-xs text-zinc-400">
                  <BilingualInline jp="申込日" kr="신청일" />:{" "}
                  {new Date(a.submittedAt).toLocaleString("ja-JP")}
                </time>
              </div>
              {a.contact && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <BilingualInline jp="連絡先" kr="연락처" />: {a.contact}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
