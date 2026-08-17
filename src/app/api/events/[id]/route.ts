// 관리자 전용 — 이벤트 수정/삭제
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";

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

  const patch: Parameters<typeof repository.updateEvent>[1] = {};
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.content === "string") patch.content = body.content.trim();
  if ("eventDate" in body)
    patch.eventDate = typeof body.eventDate === "string" && body.eventDate.trim() ? body.eventDate.trim() : null;
  if ("coverPhotoUrl" in body)
    patch.coverPhotoUrl =
      typeof body.coverPhotoUrl === "string" && body.coverPhotoUrl.trim() ? body.coverPhotoUrl.trim() : null;
  if ("venueInfo" in body)
    patch.venueInfo = typeof body.venueInfo === "string" && body.venueInfo.trim() ? body.venueInfo.trim() : null;
  if ("capacity" in body)
    patch.capacity =
      typeof body.capacity === "number" && Number.isFinite(body.capacity) && body.capacity > 0
        ? Math.floor(body.capacity)
        : null;
  if (typeof body.closed === "boolean") patch.closed = body.closed;

  if (patch.title === "" || patch.content === "") {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "제목과 내용은 비울 수 없습니다." } },
      { status: 400 }
    );
  }

  try {
    const updated = await repository.updateEvent(id, patch);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("이벤트 수정 실패", error);
    return internalErrorResponse("이벤트 수정 중 오류가 발생했습니다.");
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
    await repository.deleteEvent(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("이벤트 삭제 실패", error);
    return internalErrorResponse("이벤트 삭제 중 오류가 발생했습니다.");
  }
}
