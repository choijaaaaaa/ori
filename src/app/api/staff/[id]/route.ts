// 관리자 전용 — Staff 소개 수정/삭제
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse, notFoundResponse } from "@/lib/api-error";
import { NotFoundError } from "@/lib/errors";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "요청 본문이 올바르지 않습니다." } },
      { status: 400 }
    );
  }

  const patch: Parameters<typeof repository.updateStaffMember>[1] = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if ("imageUrl" in body)
    patch.imageUrl = typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;
  if (typeof body.bio === "string") patch.bio = body.bio.trim();

  if (patch.name === "") {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "이름은 비울 수 없습니다." } },
      { status: 400 }
    );
  }

  try {
    const updated = await repository.updateStaffMember(id, patch);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return notFoundResponse(error.message);
    }
    console.error("Staff 수정 실패", error);
    return internalErrorResponse("Staff 수정 중 오류가 발생했습니다.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    await repository.deleteStaffMember(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Staff 삭제 실패", error);
    return internalErrorResponse("Staff 삭제 중 오류가 발생했습니다.");
  }
}
