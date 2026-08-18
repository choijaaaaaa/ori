// 홈 화면 최근 인스타그램 게시물 — 의뢰인이 Meta 개발자 콘솔에서 토큰을 발급하기 전까지는
// 환경변수 미설정 상태이므로 공개 방문자에게는 이 섹션 자체가 보이지 않는다.
// (관리자에게만 설정이 안 됐다는 안내를 살짝 보여준다.)
import { Bilingual, BilingualInline } from "@/components/bilingual";
import type { InstagramPost } from "@/lib/instagram";

export default function HomeInstagramSection({
  posts,
  isConfigured,
  isAdmin,
}: {
  posts: InstagramPost[];
  isConfigured: boolean;
  isAdmin: boolean;
}) {
  if (!isConfigured) {
    if (!isAdmin) return null;
    return (
      <section className="flex flex-col gap-2">
        <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          <BilingualInline
            jp="管理者モード：Instagram連携が未設定です（INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_BUSINESS_ACCOUNT_ID の環境変数が必要）。"
            kr="관리자 모드: 인스타그램 연동이 아직 설정되지 않았습니다 (INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_BUSINESS_ACCOUNT_ID 환경변수 필요)."
          />
        </p>
      </section>
    );
  }

  // 설정은 됐는데 게시물이 없거나(신규 계정) 일시적으로 조회에 실패한 경우 — 방문자에게는
  // 조용히 숨기는 게 낫다(빈 섹션을 굳이 보여줄 필요 없음).
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="instagram-heading" className="flex flex-col gap-4">
      <Bilingual
        as="h2"
        jp={
          <span id="instagram-heading" className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Instagram
          </span>
        }
        kr="인스타그램"
      />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <li key={post.id}>
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border border-amber-100 shadow-sm transition-transform hover:scale-[1.02] dark:border-zinc-800"
              aria-label={post.caption ?? "Instagramの投稿を見る / 인스타그램 게시물 보기"}
            >
              <img
                src={post.imageUrl}
                alt={post.caption ?? "Instagramの投稿 / 인스타그램 게시물"}
                className="aspect-square w-full object-cover"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
