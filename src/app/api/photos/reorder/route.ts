// 관리자 전용 — 사진 갤러리 드래그앤드롭 순서 저장
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const orderedIds = Array.isArray(body?.orderedIds)
    ? body.orderedIds.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
    : null;

  if (!orderedIds || orderedIds.length === 0) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "순서 정보가 올바르지 않습니다." } },
      { status: 400 }
    );
  }

  try {
    await repository.reorderPhotos(orderedIds);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("사진 순서 변경 실패", error);
    return internalErrorResponse("순서 변경 중 오류가 발생했습니다.");
  }
}
