import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth";
import { ADMIN_COOKIE, getSessionTokenValue } from "@/lib/session";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { internalErrorResponse } from "@/lib/api-error";

export async function POST(request: Request) {
  // 무차별 대입(brute force) 로그인 시도를 막기 위한 최소한의 요청 제한.
  if (isRateLimited(`login:${getClientIp(request)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "잠시 후 다시 시도해주세요." } },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "비밀번호를 입력해주세요." } },
      { status: 400 }
    );
  }

  let ok: boolean;
  try {
    ok = await verifyAdminPassword(password);
  } catch (error) {
    console.error("관리자 인증 확인 실패", error);
    return internalErrorResponse("로그인 처리 중 오류가 발생했습니다.");
  }
  if (!ok) {
    return NextResponse.json(
      { error: { code: "INVALID_PASSWORD", message: "비밀번호가 올바르지 않습니다." } },
      { status: 401 }
    );
  }

  const token = await getSessionTokenValue();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
