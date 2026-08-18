// 인스타그램 최근 게시물 조회 — 의뢰인이 Meta 개발자 콘솔에서 토큰을 발급하고
// INSTAGRAM_ACCESS_TOKEN/INSTAGRAM_BUSINESS_ACCOUNT_ID 환경변수만 채우면 바로 동작한다.
// 둘 중 하나라도 없으면 조용히 빈 배열을 반환해, 홈 화면에서 이 섹션이 자연스럽게 숨겨진다
// (연동 전 상태에서도 사이트 전체가 깨지지 않아야 하므로).
const GRAPH_API_VERSION = "v21.0";
const POST_LIMIT = 6;

export interface InstagramPost {
  id: string;
  caption?: string;
  imageUrl: string; // 비디오는 media_url 대신 thumbnail_url을 사용
  permalink: string;
  timestamp: string;
}

interface InstagramGraphMediaItem {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export function isInstagramConfigured(): boolean {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID);
}

export async function fetchRecentInstagramPosts(): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!token || !accountId) return [];

  const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${accountId}/media`);
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit", String(POST_LIMIT));
  url.searchParams.set("access_token", token);

  try {
    // 홈 화면은 force-dynamic이라 이 fetch 자체도 매 요청 실행되지만, revalidate 힌트를
    // 남겨두면(캐시 전략이 바뀌어도) 불필요한 API 호출을 줄이는 데 도움이 된다.
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error("인스타그램 게시물 조회 실패", res.status, await res.text().catch(() => ""));
      return [];
    }
    const json: { data?: InstagramGraphMediaItem[] } = await res.json();
    const items = json.data ?? [];

    return items
      .map((item): InstagramPost | null => {
        const imageUrl = item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url;
        if (!imageUrl || !item.permalink) return null;
        return {
          id: item.id,
          caption: item.caption,
          imageUrl,
          permalink: item.permalink,
          timestamp: item.timestamp,
        };
      })
      .filter((item): item is InstagramPost => item !== null);
  } catch (error) {
    console.error("인스타그램 게시물 조회 중 오류", error);
    return [];
  }
}
