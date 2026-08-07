// Edge(middleware)와 Node(API route) 양쪽에서 쓰는 세션 토큰 계산 로직.
// fs를 쓰지 않아야 middleware(Edge runtime)에서도 동작한다.
export const ADMIN_COOKIE = "ori_admin_session";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getSessionTokenValue(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "ori-dev-session-secret";
  return sha256Hex(`ori-admin-session:${secret}`);
}
