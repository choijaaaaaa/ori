// 이벤트(교류회 회차) 상세 — 내용과 오시는 길을 함께 보여준다
import Link from "next/link";
import { notFound } from "next/navigation";
import { repository } from "@/lib/repository";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { DecorativeBackground } from "@/components/decorative-background";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event;
  try {
    event = await repository.getEvent(id);
  } catch (error) {
    console.error("이벤트 상세 로드 실패", error);
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-amber-50 px-6 py-16 text-center dark:bg-zinc-950">
        <DecorativeBackground />
        <p
          role="alert"
          className="relative z-10 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          <BilingualInline
            jp="データの読み込み中に問題が発生しました。しばらくしてから再度お試しください。"
            kr="데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
          />
        </p>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  // 정원 표시용 활성 신청자 수 — 조회 실패는 표시를 생략할 뿐 페이지 전체를 깨뜨리지 않는다.
  const activeCount = await repository.countActiveApplications(event.id).catch(() => 0);
  const isFull = event.closed || (typeof event.capacity === "number" && activeCount >= event.capacity);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-amber-50 dark:bg-zinc-950">
      <DecorativeBackground />
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16 sm:px-10">
        <Link
          href="/"
          className="text-sm text-amber-700 hover:underline dark:text-amber-400"
        >
          <BilingualInline jp="← ホームに戻る" kr="홈으로" />
        </Link>

        {event.coverPhotoUrl && (
          <img
            src={event.coverPhotoUrl}
            alt={event.title}
            className="aspect-video w-full rounded-xl object-cover"
          />
        )}

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {event.eventDate && (
              <span className="w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                {new Date(event.eventDate).toLocaleDateString("ja-JP")}
              </span>
            )}
            {isFull && (
              <span className="w-fit rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                <BilingualInline jp="満席・受付終了" kr="마감" />
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{event.title}</h1>
          {typeof event.capacity === "number" && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <BilingualInline
                jp={`定員 ${event.capacity}名中 ${activeCount}名申し込み済み`}
                kr={`정원 ${event.capacity}명 중 ${activeCount}명 신청`}
              />
            </p>
          )}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          {event.content}
        </p>

        {event.venueInfo && (
          <section aria-labelledby="event-access-heading" className="flex flex-col gap-3">
            <Bilingual
              as="h2"
              jp={
                <span id="event-access-heading" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  アクセス
                </span>
              }
              kr="오시는 길"
            />
            <p className="whitespace-pre-wrap rounded-xl border border-amber-100 bg-white px-5 py-4 text-sm leading-7 text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              {event.venueInfo}
            </p>
          </section>
        )}

        {isFull ? (
          <div className="mt-4 flex flex-col gap-1.5">
            <span
              aria-disabled="true"
              className="inline-flex w-fit cursor-not-allowed items-center justify-center rounded-full bg-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
            >
              <BilingualInline jp="受付を終了しました" kr="마감되었습니다" />
            </span>
          </div>
        ) : (
          <Link
            href={`/apply?eventId=${event.id}`}
            className="mt-4 inline-flex w-fit items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            aria-label="参加を申し込む / 참가 신청하기"
          >
            <BilingualInline jp="参加を申し込む" kr="참가 신청하기" />
          </Link>
        )}
      </main>
    </div>
  );
}
