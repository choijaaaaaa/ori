// 참가 신청 페이지 — 이벤트 목록을 불러와 폼에 전달한다 (쿼리의 eventId가 있으면 미리 선택)
import { repository } from "@/lib/repository";
import ApplyForm from "./apply-form";

// 관리자가 추가한 이벤트가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
export const dynamic = "force-dynamic";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;
  const events = await repository.listEvents().catch(() => []);

  return <ApplyForm events={events} initialEventId={eventId} />;
}
