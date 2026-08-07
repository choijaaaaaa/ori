// 설문 응답 알림 스텁. TODO 아님 — 지금은 mock 로그만 남기고, 추후 Resend 등 실제 이메일 발송 서비스로 이 함수 내부만 교체하면 된다.
import type { SurveyResponse } from "./types";

export async function sendSurveyNotification(response: SurveyResponse): Promise<void> {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  const target = to ? to : "설정 안 됨 (ADMIN_NOTIFY_EMAIL 미설정)";

  // 디버그성 로그가 아니라 실제 알림 발송을 대체하는 스텁이라 console.error로 남긴다.
  console.error(
    `[MOCK EMAIL] 새 설문 응답: ${response.participantName} (수신: ${target}, 제출시각: ${response.submittedAt}, id: ${response.id})`
  );
}
