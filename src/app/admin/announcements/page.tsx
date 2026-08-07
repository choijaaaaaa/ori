// 관리자 공지사항 관리 화면 — 목록 조회 + 새 공지 작성
import { repository } from "@/lib/repository";
import type { Announcement } from "@/lib/types";
import AnnouncementForm from "./announcement-form";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(mock 단계 fs 읽기 특성상 필수).
export const dynamic = "force-dynamic";

async function loadAnnouncements(): Promise<
  { ok: true; items: Announcement[] } | { ok: false }
> {
  try {
    const items = await repository.listAnnouncements();
    return { ok: true, items };
  } catch (error) {
    console.error("공지사항 목록 로드 실패", error);
    return { ok: false };
  }
}

export default async function AdminAnnouncementsPage() {
  const data = await loadAnnouncements();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">공지사항 관리</h1>

      <AnnouncementForm />

      <section aria-labelledby="announcement-list-heading" className="flex flex-col gap-3">
        <h2
          id="announcement-list-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          등록된 공지
        </h2>

        {!data.ok && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            공지사항을 불러오는 중 문제가 발생했습니다.
          </p>
        )}

        {data.ok && data.items.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">아직 공지가 없습니다.</p>
        )}

        {data.ok && data.items.length > 0 && (
          <ul className="flex flex-col gap-3">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                  {item.content}
                </p>
                <time dateTime={item.createdAt} className="mt-2 block text-xs text-zinc-400">
                  {new Date(item.createdAt).toLocaleString("ko-KR")}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
