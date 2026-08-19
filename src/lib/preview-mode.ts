// 관리자가 로그아웃하지 않고도 방문자 화면 그대로 확인할 수 있게 하는 미리보기 모드.
// 이 쿠키는 권한을 바꾸지 않는다 — 관리자 세션은 그대로 유효하고, 편집 UI 노출 여부만 제어한다.
import { cookies } from "next/headers";

export const PREVIEW_MODE_COOKIE = "ori_preview_mode";

export async function isPreviewMode(): Promise<boolean> {
  const store = await cookies();
  return store.get(PREVIEW_MODE_COOKIE)?.value === "1";
}
