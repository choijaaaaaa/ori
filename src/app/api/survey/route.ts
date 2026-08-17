// 설문 응답 제출(공개) API — 제출 시 관리자에게 알림(mock)을 함께 보낸다
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { sendSurveyNotification } from "@/lib/notify";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { internalErrorResponse } from "@/lib/api-error";

export async function POST(request: Request) {
  // 봇 스팸으로 설문 응답이 무한정 쌓이는 걸 막기 위한 최소한의 요청 제한.
  if (isRateLimited(`survey:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "잠시 후 다시 시도해주세요." } },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const participantName =
    typeof body?.participantName === "string" ? body.participantName.trim() : "";
  const contact = typeof body?.contact === "string" ? body.contact.trim() : "";
  const answers =
    body?.answers && typeof body.answers === "object" && !Array.isArray(body.answers)
      ? (body.answers as Record<string, string>)
      : null;

  if (!participantName || !answers || Object.keys(answers).length === 0) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: "참가자 이름과 최소 1개 이상의 답변을 입력해주세요.",
        },
      },
      { status: 400 }
    );
  }

  let created;
  try {
    created = await repository.createSurveyResponse({
      participantName,
      contact: contact || undefined,
      answers,
    });
  } catch (error) {
    console.error("설문 응답 저장 실패", error);
    return internalErrorResponse("설문 제출 중 오류가 발생했습니다.");
  }

  try {
    await sendSurveyNotification(created);
  } catch (error) {
    // 알림 실패가 설문 제출 자체를 막으면 안 되므로 로그만 남기고 계속 진행한다.
    console.error("설문 알림 발송 실패", error);
  }

  return NextResponse.json(created, { status: 201 });
}
