// 참가 신청 페이지 — 이벤트 목록을 불러와 폼에 전달한다 (쿼리의 eventId가 있으면 미리 선택)
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { APPLY_INTRO_KEY, APPLY_INTRO_DEFAULT } from "@/lib/site-text-defaults";
import ApplyForm from "./apply-form";

// 관리자가 추가한 이벤트/문구가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
export const dynamic = "force-dynamic";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;
  const events = await repository.listEvents().catch(() => []);
  const introText = await repository.getSiteText(APPLY_INTRO_KEY).catch(() => null);
  const fields = await repository.listApplyFormFields().catch(() => []);
  const isAdmin = await isAdminAuthenticated();

  // 정원/마감 여부를 옵션에 표시하기 위해 회차별 활성 신청자 수를 함께 가져온다.
  // 개별 조회가 실패해도 폼 전체가 깨지면 안 되므로 실패한 회차는 0명으로 처리한다.
  const activeCounts = await Promise.all(
    events.map((event) => repository.countActiveApplications(event.id).catch(() => 0))
  );
  const activeCountByEventId = Object.fromEntries(
    events.map((event, idx) => [event.id, activeCounts[idx]])
  );

  return (
    <ApplyForm
      events={events}
      activeCountByEventId={activeCountByEventId}
      initialEventId={eventId}
      introJp={introText?.valueJp || APPLY_INTRO_DEFAULT.jp}
      introKr={introText?.valueKr || APPLY_INTRO_DEFAULT.kr}
      fields={fields}
      isAdmin={isAdmin}
    />
  );
}
