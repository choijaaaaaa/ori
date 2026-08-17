// 관리자 전용 — 신청 상태 변경(대기/확정/참석/취소)
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";
import type { ApplicationStatus } from "@/lib/types";

const VALID_STATUSES: ApplicationStatus[] = ["pending", "confirmed", "attended", "cancelled"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (typeof status !== "string" || !VALID_STATUSES.includes(status as ApplicationStatus)) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "올바른 상태값이 아닙니다." } },
      { status: 400 }
    );
  }

  try {
    const updated = await repository.updateApplicationStatus(id, status as ApplicationStatus);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("신청 상태 변경 실패", error);
    return internalErrorResponse("상태 변경 중 오류가 발생했습니다.");
  }
}
