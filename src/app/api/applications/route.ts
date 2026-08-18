// 참가 신청(공개 POST) + 관리자 신청 내역 조회(GET) API
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { sendApplicationNotification } from "@/lib/notify";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { internalErrorResponse } from "@/lib/api-error";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }
  try {
    const items = await repository.listApplications();
    return NextResponse.json(items);
  } catch (error) {
    console.error("신청 내역 조회 실패", error);
    return internalErrorResponse("신청 내역을 불러오는 중 오류가 발생했습니다.");
  }
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
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const eventId = typeof body?.eventId === "string" ? body.eventId.trim() : "";
  const answers: Record<string, string> = {};
  if (body?.answers && typeof body.answers === "object") {
    for (const [key, value] of Object.entries(body.answers)) {
      if (typeof value === "string" && value.trim()) answers[key] = value.trim();
    }
  }
  // 구버전 폼(연락처 단일 필드)과의 호환 + 동적 폼의 email 항목을 신청 대표 연락처로 사용.
  const legacyContact = typeof body?.contact === "string" ? body.contact.trim() : "";
  const contact = answers["email"] || legacyContact;

  if (!name) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "이름을 입력해주세요." } },
      { status: 400 }
    );
  }

  try {
    const fields = await repository.listApplyFormFields();
    for (const field of fields) {
      if (field.type === "image") continue; // 안내용 블록, 응답 없음
      const isRequired = field.required || (field.type === "checkbox_group" && field.requireAll);
      if (!isRequired) continue;
      const value = answers[field.fieldKey] ?? "";
      if (!value) {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_INPUT",
              message: `필수 항목을 입력해주세요: ${field.labelKr || field.labelJp}`,
            },
          },
          { status: 400 }
        );
      }
      if (field.type === "checkbox_group" && field.requireAll) {
        // 클라이언트(apply-form.tsx)의 CHECKBOX_GROUP_SEPARATOR와 반드시 일치해야 한다.
        const selectedCount = value.split(" | ").filter((v) => v.trim()).length;
        if (selectedCount < field.options.length) {
          return NextResponse.json(
            {
              error: {
                code: "INVALID_INPUT",
                message: `모든 확인 항목에 동의해야 합니다: ${field.labelKr || field.labelJp}`,
              },
            },
            { status: 400 }
          );
        }
      }
    }
  } catch (error) {
    console.error("신청 폼 항목 검증 실패", error);
    return internalErrorResponse("신청 접수 중 오류가 발생했습니다.");
  }

  if (eventId) {
    try {
      const event = await repository.getEvent(eventId);
      if (!event) {
        // 신청 중 이벤트가 삭제/변조됐을 수 있다 — FK 위반으로 500이 나기 전에 명확히 안내.
        return NextResponse.json(
          {
            error: {
              code: "EVENT_NOT_FOUND",
              message: "선택한 회차를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.",
            },
          },
          { status: 400 }
        );
      }
      const activeCount = await repository.countActiveApplications(eventId);
      const isFull = typeof event.capacity === "number" && activeCount >= event.capacity;
      if (event.closed || isFull) {
        return NextResponse.json(
          { error: { code: "EVENT_FULL", message: "죄송합니다, 해당 회차는 마감되었습니다." } },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("정원 확인 실패", error);
      return internalErrorResponse("신청 접수 중 오류가 발생했습니다.");
    }
  }

  let created;
  try {
    created = await repository.createApplication({
      name,
      contact: contact || undefined,
      message: message || undefined,
      eventId: eventId || undefined,
      answers,
    });
  } catch (error) {
    console.error("신청 저장 실패", error);
    return internalErrorResponse("신청 접수 중 오류가 발생했습니다.");
  }

  try {
    await sendApplicationNotification(created);
  } catch (error) {
    console.error("신청 알림 발송 실패", error);
  }

  return NextResponse.json(created, { status: 201 });
}
