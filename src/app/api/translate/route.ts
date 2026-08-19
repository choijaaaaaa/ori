// 관리자 전용 — 일본어 텍스트를 한국어로 자동 번역 (MyMemory, API 키/가입 불필요)
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";
import { translateJapaneseToKorean } from "@/lib/translate";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";
  if (!text.trim()) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "번역할 텍스트가 없습니다." } },
      { status: 400 }
    );
  }

  try {
    const translated = await translateJapaneseToKorean(text);
    return NextResponse.json({ translated });
  } catch (error) {
    console.error("자동 번역 실패", error);
    return internalErrorResponse("번역 중 오류가 발생했습니다.");
  }
}
