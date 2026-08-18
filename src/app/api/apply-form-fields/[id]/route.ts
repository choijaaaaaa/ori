// 관리자 전용 — 참가 신청 폼 항목 수정/삭제
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

  const patch: Parameters<typeof repository.updateApplyFormField>[1] = {};
  if (typeof body.labelJp === "string") patch.labelJp = body.labelJp.trim();
  if (typeof body.labelKr === "string") patch.labelKr = body.labelKr.trim();
  if ("helpJp" in body)
    patch.helpJp = typeof body.helpJp === "string" ? body.helpJp.trim() : "";
  if ("helpKr" in body)
    patch.helpKr = typeof body.helpKr === "string" ? body.helpKr.trim() : "";
  if (Array.isArray(body.options)) {
    patch.options = body.options
      .filter((o: unknown) => o && typeof o === "object")
      .map((o: { jp?: unknown; kr?: unknown }) => ({
        jp: typeof o.jp === "string" ? o.jp.trim() : "",
        kr: typeof o.kr === "string" ? o.kr.trim() : "",
      }))
      .filter((o: { jp: string }) => o.jp);
  }
  if (typeof body.required === "boolean") patch.required = body.required;
  if (typeof body.requireAll === "boolean") patch.requireAll = body.requireAll;
  if ("imageUrl" in body)
    patch.imageUrl = typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;

  if (patch.labelJp === "") {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "일본어 라벨은 비울 수 없습니다." } },
      { status: 400 }
    );
  }

  try {
    const updated = await repository.updateApplyFormField(id, patch);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return notFoundResponse(error.message);
    }
    console.error("신청 폼 항목 수정 실패", error);
    return internalErrorResponse("항목 수정 중 오류가 발생했습니다.");
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
    await repository.deleteApplyFormField(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("신청 폼 항목 삭제 실패", error);
    return internalErrorResponse("항목 삭제 중 오류가 발생했습니다.");
  }
}
