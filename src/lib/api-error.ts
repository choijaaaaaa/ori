import { NextResponse } from "next/server";

export function internalErrorResponse(message = "요청을 처리하는 중 오류가 발생했습니다.") {
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
}
