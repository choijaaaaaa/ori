// 관리자 이벤트(교류회 회차) 관리 화면 — 목록 조회 + 새 이벤트 작성
import { repository } from "@/lib/repository";
import type { EventPost, Photo } from "@/lib/types";
import EventForm from "./event-form";
import { Bilingual } from "@/components/bilingual";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(mock 단계 fs 읽기 특성상 필수).
export const dynamic = "force-dynamic";

async function loadEvents(): Promise<
  { ok: true; items: EventPost[]; photos: Photo[] } | { ok: false }
> {
  try {
    const [items, photos] = await Promise.all([
      repository.listEvents(),
      repository.listPhotos(),
    ]);
    return { ok: true, items, photos };
  } catch (error) {
    console.error("이벤트 목록 로드 실패", error);
    return { ok: false };
  }
}

export default async function AdminEventsPage() {
  const data = await loadEvents();

  return (
    <div className="flex flex-col gap-8">
      <Bilingual
        as="h1"
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
        jp="イベント管理"
        kr="이벤트 관리"
      />

      <EventForm photos={data.ok ? data.photos : []} />

      <section aria-labelledby="event-list-heading" className="flex flex-col gap-3">
        <Bilingual
          as="h2"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          jp={<span id="event-list-heading">登録済みのイベント</span>}
          kr="등록된 이벤트"
        />

        {!data.ok && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            イベントの読み込み中に問題が発生しました。
            <span className="block text-xs opacity-80">이벤트를 불러오는 중 문제가 발생했습니다.</span>
          </p>
        )}

        {data.ok && data.items.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            まだイベントがありません。
            <span className="block text-xs opacity-80">아직 등록된 이벤트가 없습니다.</span>
          </p>
        )}

        {data.ok && data.items.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {item.coverPhotoUrl ? (
                  <img
                    src={item.coverPhotoUrl}
                    alt={item.title}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-xl dark:bg-zinc-800">
                    🦆
                  </div>
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  {item.eventDate && (
                    <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      {item.eventDate}
                    </span>
                  )}
                  <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.title}
                  </p>
                  <p className="line-clamp-2 whitespace-pre-line text-xs text-zinc-500 dark:text-zinc-400">
                    {item.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
