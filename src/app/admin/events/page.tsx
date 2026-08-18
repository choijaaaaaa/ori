// 관리자 이벤트(교류회 회차) 관리 화면 — 목록 조회 + 새 이벤트 작성
import { repository } from "@/lib/repository";
import type { EventPost, Photo } from "@/lib/types";
import EventForm from "./event-form";
import EventList from "./event-list";
import { Bilingual } from "@/components/bilingual";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
export const dynamic = "force-dynamic";

async function loadEvents(): Promise<
  | { ok: true; items: (EventPost & { activeApplicants: number })[]; photos: Photo[] }
  | { ok: false }
> {
  try {
    const [items, photos] = await Promise.all([
      repository.listEvents(),
      repository.listPhotos(),
    ]);
    // 이벤트 개수가 적다는 전제로 카드마다 활성 신청자 수를 병렬 조회한다.
    const activeCounts = await Promise.all(
      items.map((item) => repository.countActiveApplications(item.id))
    );
    const itemsWithCounts = items.map((item, i) => ({
      ...item,
      activeApplicants: activeCounts[i],
    }));
    return { ok: true, items: itemsWithCounts, photos };
  } catch (error) {
    console.error("이벤트 목록 로드 실패", error);
    return { ok: false };
  }
}

export default async function AdminEventsPage() {
  const data = await loadEvents();
  // 장소가 매번 바뀌어 매 회차 새로 입력해야 하니, 가장 최근에 등록한 안내를 불러와 빠르게 고쳐 쓸 수 있게 한다.
  const sortedByRecent = data.ok
    ? [...data.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const recentVenueMapUrl = sortedByRecent.find((e) => e.venueMapUrl)?.venueMapUrl;
  const recentVenueInfo = sortedByRecent.find((e) => e.venueInfo)?.venueInfo;

  return (
    <div className="flex flex-col gap-8">
      <Bilingual
        as="h1"
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
        jp="イベント管理"
        kr="이벤트 관리"
      />

      <EventForm
        photos={data.ok ? data.photos : []}
        recentVenueMapUrl={recentVenueMapUrl}
        recentVenueInfo={recentVenueInfo}
      />

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
          <EventList
            events={data.items}
            photos={data.photos}
            recentVenueMapUrl={recentVenueMapUrl}
            recentVenueInfo={recentVenueInfo}
          />
        )}
      </section>
    </div>
  );
}
