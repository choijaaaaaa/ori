// 관리자 전용 — 미리보기 모드 켜기/끄기. 클라이언트에서 document.cookie를 직접
// 조작하던 방식(admin-access-button.tsx)을 서버 Set-Cookie로 교체 — 브라우저별
// document.cookie 타이밍/가시성 차이에 기대지 않는 더 확실한 방식.
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { PREVIEW_MODE_COOKIE } from "@/lib/preview-mode";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const enabled = body?.enabled === true;

  const res = NextResponse.json({ ok: true, enabled });
  res.cookies.set(PREVIEW_MODE_COOKIE, enabled ? "1" : "", {
    path: "/",
    maxAge: enabled ? 60 * 60 * 24 * 30 : 0,
  });
  return res;
}
