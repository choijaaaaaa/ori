// 참가 신청 폼 항목 목록 공개 조회(GET) + 관리자 항목 추가(POST) API
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";
import type { ApplyFormFieldType } from "@/lib/types";

const VALID_TYPES: ApplyFormFieldType[] = [
  "text",
  "textarea",
  "radio_group",
  "checkbox_group",
  "checkbox",
  "image",
];

export async function GET() {
  try {
    const items = await repository.listApplyFormFields();
    return NextResponse.json(items);
  } catch (error) {
    console.error("신청 폼 항목 목록 조회 실패", error);
    return internalErrorResponse("신청 폼 항목을 불러오는 중 오류가 발생했습니다.");
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const rawType = typeof body?.type === "string" ? body.type : "";
  const labelJp = typeof body?.labelJp === "string" ? body.labelJp.trim() : "";
  const labelKr = typeof body?.labelKr === "string" ? body.labelKr.trim() : "";
  const helpJp = typeof body?.helpJp === "string" ? body.helpJp.trim() : "";
  const helpKr = typeof body?.helpKr === "string" ? body.helpKr.trim() : "";
  const options = Array.isArray(body?.options)
    ? body.options
        .filter((o: unknown) => o && typeof o === "object")
        .map((o: { jp?: unknown; kr?: unknown }) => ({
          jp: typeof o.jp === "string" ? o.jp.trim() : "",
          kr: typeof o.kr === "string" ? o.kr.trim() : "",
        }))
        .filter((o: { jp: string }) => o.jp)
    : [];
  const required = body?.required === true;
  const requireAll = body?.requireAll === true;
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";

  if (!VALID_TYPES.includes(rawType as ApplyFormFieldType)) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "항목 유형이 올바르지 않습니다." } },
      { status: 400 }
    );
  }
  const type = rawType as ApplyFormFieldType;
  if (!labelJp) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "일본어 라벨을 입력해주세요." } },
      { status: 400 }
    );
  }
  if ((type === "radio_group" || type === "checkbox_group") && options.length === 0) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "선택지를 1개 이상 입력해주세요." } },
      { status: 400 }
    );
  }

  try {
    const created = await repository.createApplyFormField({
      // 관리자가 직접 입력하지 않는 내부 식별자 — 충돌 없이 자동 생성.
      fieldKey: `custom_${randomUUID().slice(0, 8)}`,
      type,
      labelJp,
      labelKr: labelKr || undefined,
      helpJp: helpJp || undefined,
      helpKr: helpKr || undefined,
      options,
      required,
      requireAll,
      imageUrl: imageUrl || undefined,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("신청 폼 항목 추가 실패", error);
    return internalErrorResponse("항목 추가 중 오류가 발생했습니다.");
  }
}
