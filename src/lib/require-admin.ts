import { cookies } from "next/headers";
import { ADMIN_COOKIE, getSessionTokenValue } from "./session";
import { isPreviewMode } from "./preview-mode";

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  const expected = await getSessionTokenValue();
  return cookie === expected;
}

// 공개 페이지의 편집 UI를 보여줄지 판단할 때 쓴다 — 실제 인증 여부(isAdminAuthenticated)와
// 별개로, 관리자가 미리보기 모드를 켰으면 로그인 상태여도 방문자 화면 그대로 보여준다.
// API 라우트의 실제 권한 검사에는 이 함수 대신 isAdminAuthenticated를 그대로 써야 한다.
export async function isAdminUiVisible(): Promise<boolean> {
  const [authenticated, preview] = await Promise.all([isAdminAuthenticated(), isPreviewMode()]);
  return authenticated && !preview;
}
