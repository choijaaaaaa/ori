// 관리자 전용 — 사진 삭제
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    await repository.deletePhoto(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("사진 삭제 실패", error);
    return internalErrorResponse("사진 삭제 중 오류가 발생했습니다.");
  }
}
