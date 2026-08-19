// 공개 홈 화면 — 서비스 소개, 이벤트(회차) 카드, 사진 갤러리
// 오시는 길은 고정 장소가 없어 회차마다 달라지므로 여기서는 안 보여주고, 이벤트별 상세(/events/[id])에서 안내한다.
// 이벤트/사진 목록은 관리자 로그인 시 그 자리에서 바로 추가·수정·삭제·드래그 순서변경할 수 있다
// (HomeEventsSection/HomePhotosSection이 담당 — apply-form.tsx의 인라인 편집 패턴과 동일).
import Link from "next/link";
import { repository } from "@/lib/repository";
import { isAdminUiVisible } from "@/lib/require-admin";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { DecorativeBackground } from "@/components/decorative-background";
import HomeEventsSection from "./home-events-section";
import HomePhotosSection from "./home-photos-section";
import HomeInstagramSection from "./home-instagram-section";
import HomeAboutSection from "./home-about-section";
import { fetchRecentInstagramPosts, isInstagramConfigured } from "@/lib/instagram";
import { ABOUT_INTRO_KEY } from "@/lib/site-text-defaults";
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
  const [data, isAdmin, instagramPosts, aboutText, staffMembers] = await Promise.all([
    loadHomeData(),
    isAdminUiVisible(),
    fetchRecentInstagramPosts(),
    repository.getSiteText(ABOUT_INTRO_KEY).catch(() => null),
    repository.listStaffMembers().catch(() => []),
  ]);
  // 장소가 매번 바뀌어 매 회차 새로 입력해야 하니, 가장 최근에 등록한 안내를 불러와 빠르게 고쳐 쓸 수 있게 한다.
  const sortedByRecent = data.ok
    ? [...data.events].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const recentVenueMapUrl = sortedByRecent.find((e) => e.venueMapUrl)?.venueMapUrl;
  const recentVenueImageUrl = sortedByRecent.find((e) => e.venueImageUrl)?.venueImageUrl;
  const recentVenueInfo = sortedByRecent.find((e) => e.venueInfo)?.venueInfo;

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

        <HomeAboutSection
          initialJp={aboutText?.valueJp ?? ""}
          initialKr={aboutText?.valueKr ?? ""}
          isAdmin={isAdmin}
          staffMembers={staffMembers}
        />

        {data.ok && (
          <>
            <HomeEventsSection
              events={data.events}
              photos={data.photos}
              isAdmin={isAdmin}
              recentVenueMapUrl={recentVenueMapUrl}
              recentVenueImageUrl={recentVenueImageUrl}
              recentVenueInfo={recentVenueInfo}
            />
            <HomePhotosSection photos={data.photos} isAdmin={isAdmin} />
          </>
        )}

        <HomeInstagramSection
          posts={instagramPosts}
          isConfigured={isInstagramConfigured()}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  );
}
