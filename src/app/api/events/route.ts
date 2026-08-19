// 교류회 회차(이벤트) 목록 공개 조회 + 관리자 작성 API
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";
import { isValidDateString, isValidHttpUrl } from "@/lib/validation";

export async function GET() {
  try {
    const items = await repository.listEvents();
    return NextResponse.json(items);
  } catch (error) {
    console.error("이벤트 목록 조회 실패", error);
    return internalErrorResponse("이벤트 목록을 불러오는 중 오류가 발생했습니다.");
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
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const eventDate = typeof body?.eventDate === "string" ? body.eventDate.trim() : "";
  const coverPhotoUrl = typeof body?.coverPhotoUrl === "string" ? body.coverPhotoUrl.trim() : "";
  const venueMapUrl = typeof body?.venueMapUrl === "string" ? body.venueMapUrl.trim() : "";
  const venueImageUrl = typeof body?.venueImageUrl === "string" ? body.venueImageUrl.trim() : "";
  const venueInfo = typeof body?.venueInfo === "string" ? body.venueInfo.trim() : "";
  const capacity =
    typeof body?.capacity === "number" && Number.isFinite(body.capacity) && body.capacity > 0
      ? Math.floor(body.capacity)
      : undefined;
  const closed = body?.closed === true;

  if (!title || !content) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "제목과 내용을 입력해주세요." } },
      { status: 400 }
    );
  }
  if (eventDate && !isValidDateString(eventDate)) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "모임 일자 형식이 올바르지 않습니다 (YYYY-MM-DD)." } },
      { status: 400 }
    );
  }
  if (venueMapUrl && !isValidHttpUrl(venueMapUrl)) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "지도 링크 형식이 올바르지 않습니다." } },
      { status: 400 }
    );
  }

  try {
    const created = await repository.createEvent({
      title,
      content,
      eventDate: eventDate || undefined,
      coverPhotoUrl: coverPhotoUrl || undefined,
      venueMapUrl: venueMapUrl || undefined,
      venueImageUrl: venueImageUrl || undefined,
      venueInfo: venueInfo || undefined,
      capacity,
      closed,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("이벤트 등록 실패", error);
    return internalErrorResponse("이벤트 등록 중 오류가 발생했습니다.");
  }
}
