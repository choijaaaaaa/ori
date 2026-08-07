// 참가 신청(공개 POST) + 관리자 신청 내역 조회(GET) API
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { sendApplicationNotification } from "@/lib/notify";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }
  const items = await repository.listApplications();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  // 봇 스팸으로 신청이 무한정 쌓이는 걸 막기 위한 최소한의 요청 제한.
  if (isRateLimited(`application:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "잠시 후 다시 시도해주세요." } },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const contact = typeof body?.contact === "string" ? body.contact.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const eventId = typeof body?.eventId === "string" ? body.eventId.trim() : "";

  if (!name) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "이름을 입력해주세요." } },
      { status: 400 }
    );
  }

  const created = await repository.createApplication({
    name,
    contact: contact || undefined,
    message: message || undefined,
    eventId: eventId || undefined,
  });

  try {
    await sendApplicationNotification(created);
  } catch (error) {
    console.error("신청 알림 발송 실패", error);
  }

  return NextResponse.json(created, { status: 201 });
}
