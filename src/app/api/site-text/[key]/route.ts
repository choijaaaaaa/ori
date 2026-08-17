// 관리자가 직접 고치는 사이트 문구 — 조회는 공개, 수정은 관리자 전용.
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  try {
    const text = await repository.getSiteText(key);
    return NextResponse.json(text);
  } catch (error) {
    console.error("사이트 문구 조회 실패", error);
    return internalErrorResponse("문구를 불러오는 중 오류가 발생했습니다.");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { key } = await params;
  const body = await request.json().catch(() => null);
  const valueJp = typeof body?.valueJp === "string" ? body.valueJp.trim() : "";
  const valueKr = typeof body?.valueKr === "string" ? body.valueKr.trim() : "";

  if (!valueJp) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "일본어 문구를 입력해주세요." } },
      { status: 400 }
    );
  }

  try {
    const updated = await repository.upsertSiteText(key, { valueJp, valueKr });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("사이트 문구 저장 실패", error);
    return internalErrorResponse("문구 저장 중 오류가 발생했습니다.");
  }
}
