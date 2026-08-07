// 공개 홈 화면 — 서비스 소개, 공지사항, 사진 갤러리
import Link from "next/link";
import { repository } from "@/lib/repository";
import type { Announcement, Photo } from "@/lib/types";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(mock 단계 fs 읽기 특성상 필수).
export const dynamic = "force-dynamic";

async function loadHomeData(): Promise<
  | { ok: true; announcements: Announcement[]; photos: Photo[] }
  | { ok: false }
> {
  try {
    const [announcements, photos] = await Promise.all([
      repository.listAnnouncements(),
      repository.listPhotos(),
    ]);
    return { ok: true, announcements, photos };
  } catch (error) {
    console.error("홈 데이터 로드 실패", error);
    return { ok: false };
  }
}

export default async function Home() {
  const data = await loadHomeData();

  return (
    <div className="flex flex-1 flex-col bg-amber-50 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-16 px-6 py-16 sm:px-10">
        <section className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            한일교류회
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            한국과 일본을 잇는 따뜻한 만남, 한일교류회에서 함께해요.
          </p>
          <Link
            href="/survey"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            aria-label="설문에 참여하기"
          >
            설문 참여하기
          </Link>
        </section>

        {!data.ok && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )}

        {data.ok && (
          <>
            <section aria-labelledby="announcements-heading" className="flex flex-col gap-4">
              <h2
                id="announcements-heading"
                className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
              >
                공지사항
              </h2>
              {data.announcements.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  등록된 공지가 없습니다.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {data.announcements.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {item.title}
                      </h3>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                        {item.content}
                      </p>
                      <time
                        dateTime={item.createdAt}
                        className="mt-2 block text-xs text-zinc-400"
                      >
                        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="gallery-heading" className="flex flex-col gap-4">
              <h2
                id="gallery-heading"
                className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
              >
                사진 갤러리
              </h2>
              {data.photos.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  등록된 사진이 없습니다.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {data.photos.map((photo) => (
                    <li key={photo.id} className="flex flex-col gap-1">
                      <img
                        src={photo.url}
                        alt={photo.caption ?? "한일교류회 활동 사진"}
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

      <footer className="py-6 text-center">
        <Link
          href="/admin/login"
          className="text-[11px] text-zinc-300 hover:text-zinc-400 dark:text-zinc-700 dark:hover:text-zinc-600"
          aria-label="관리자 페이지로 이동"
        >
          관리자
        </Link>
      </footer>
    </div>
  );
}
