// 공개 홈 화면 — 서비스 소개, 이벤트(회차) 카드, 사진 갤러리
// 오시는 길은 고정 장소가 없어 회차마다 달라지므로 여기서는 안 보여주고, 이벤트별 상세(/events/[id])에서 안내한다.
import Link from "next/link";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { DecorativeBackground } from "@/components/decorative-background";
import { AdminInlineLink } from "@/components/admin-inline-link";
import type { EventPost, Photo } from "@/lib/types";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
export const dynamic = "force-dynamic";

async function loadHomeData(): Promise<
  | { ok: true; events: EventPost[]; photos: Photo[] }
  | { ok: false }
> {
  try {
    const [events, photos] = await Promise.all([
      repository.listEvents(),
      repository.listPhotos(),
    ]);
    return { ok: true, events, photos };
  } catch (error) {
    console.error("홈 데이터 로드 실패", error);
    return { ok: false };
  }
}

export default async function Home() {
  const [data, isAdmin] = await Promise.all([loadHomeData(), isAdminAuthenticated()]);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-amber-50 dark:bg-zinc-950">
      <DecorativeBackground />
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col gap-16 px-6 py-16 sm:px-10">
        <section className="flex flex-col items-center gap-4 text-center">
          <Bilingual
            as="h1"
            jp={
              <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                日韓交流会
              </span>
            }
            kr="일한교류회"
            krClassName="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-normal"
          />
          <Bilingual
            as="p"
            className="max-w-xl"
            jp={
              <span className="text-base leading-7 text-zinc-600 dark:text-zinc-300">
                日本語と韓国語、二つの言語と文化をつなぐ温かい出会いの場です。
              </span>
            }
            kr="한국어와 일본어, 두 언어와 문화를 잇는 따뜻한 만남의 자리입니다."
          />
          <Link
            href="/apply"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            aria-label="参加を申し込む / 참가 신청하기"
          >
            <BilingualInline jp="参加を申し込む" kr="참가 신청하기" />
          </Link>
        </section>

        {!data.ok && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            <BilingualInline
              jp="データの読み込み中に問題が発生しました。しばらくしてから再度お試しください。"
              kr="데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            />
          </p>
        )}

        <section aria-labelledby="about-heading" className="flex flex-col gap-4">
          <Bilingual
            as="h2"
            jp={<span id="about-heading" className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">団体紹介</span>}
            kr="소개"
          />
          <Bilingual
            as="div"
            className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            jp={
              <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                日韓交流会は、大阪梅田を拠点に活動する言語交流コミュニティです。日本語を学びたい方、韓国語を学びたい方が気軽に集まり、言語交換やゲーム、フリートークを通じて交流しています。初めての方も日本語だけで参加いただけます。
              </p>
            }
            kr={
              <p className="mt-2 text-sm leading-7">
                일한교류회는 오사카 우메다를 거점으로 활동하는 언어 교류 커뮤니티입니다. 일본어를 배우고 싶은 분, 한국어를 배우고 싶은 분이 편하게 모여 언어교환·게임·프리토크를 통해 교류합니다. 처음 오시는 분도 부담 없이 참여하실 수 있어요.
              </p>
            }
          />
        </section>

        {data.ok && (
          <>
            <section aria-labelledby="events-heading" className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Bilingual
                  as="h2"
                  jp={<span id="events-heading" className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">イベント一覧</span>}
                  kr="모임 일정"
                />
                {isAdmin && (
                  <AdminInlineLink href="/admin/events" jp="+ イベントを追加" kr="+ 모임 추가" />
                )}
              </div>
              {data.events.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  <BilingualInline jp="予定されているイベントはまだありません。" kr="예정된 모임이 아직 없습니다." />
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {data.events.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/events/${item.id}`}
                        className="flex flex-col overflow-hidden rounded-xl border border-amber-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        {item.coverPhotoUrl ? (
                          <img
                            src={item.coverPhotoUrl}
                            alt={item.title}
                            className="aspect-video w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-video w-full items-center justify-center bg-amber-100 text-3xl dark:bg-zinc-800">
                            🦆
                          </div>
                        )}
                        <div className="flex flex-col gap-1 px-5 py-4">
                          {item.eventDate && (
                            <span className="w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              {new Date(item.eventDate).toLocaleDateString("ja-JP")}
                            </span>
                          )}
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                            {item.title}
                          </h3>
                          <p className="line-clamp-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-300">
                            {item.content}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="gallery-heading" className="flex flex-col gap-4">
              <Bilingual
                as="h2"
                jp={<span id="gallery-heading" className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">フォトギャラリー</span>}
                kr="사진 갤러리"
              />
              {data.photos.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  <BilingualInline jp="写真はまだありません。" kr="등록된 사진이 없습니다." />
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {data.photos.map((photo) => (
                    <li key={photo.id} className="flex flex-col gap-1">
                      <img
                        src={photo.url}
                        alt={photo.caption ?? "日韓交流会の活動写真 / 일한교류회 활동 사진"}
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                      {photo.caption && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {photo.caption}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
