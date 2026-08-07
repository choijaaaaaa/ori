// 이벤트(교류회 회차) 상세 — 내용과 오시는 길을 함께 보여준다
import Link from "next/link";
import { notFound } from "next/navigation";
import { repository } from "@/lib/repository";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { DecorativeBackground } from "@/components/decorative-background";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(mock 단계 fs 읽기 특성상 필수).
export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await repository.getEvent(id);

  if (!event) {
    notFound();
  }

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
          {event.eventDate && (
            <span className="w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {new Date(event.eventDate).toLocaleDateString("ja-JP")}
            </span>
          )}
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{event.title}</h1>
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

        <Link
          href="/apply"
          className="mt-4 inline-flex w-fit items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          aria-label="参加を申し込む / 참가 신청하기"
        >
          <BilingualInline jp="参加を申し込む" kr="참가 신청하기" />
        </Link>
      </main>
    </div>
  );
}
