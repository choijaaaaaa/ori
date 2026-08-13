import { createClient } from "@supabase/supabase-js";

// 서버 전용 클라이언트. service_role 키를 쓰므로 RLS를 우회한다 —
// 이 클라이언트는 Route Handler/서버 컴포넌트에서만 쓰고 브라우저로 절대 넘기지 않는다.
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되어 있지 않습니다.");
}

// WHY db.schema:"ori"인지(2026-08-13, 임시): Supabase 무료 티어 2프로젝트
// 한계 때문에 health-shorts 프로젝트 안의 별도 스키마(ori)로 임시 이전함
// — health-shorts 자체 테이블(public 스키마)과 완전히 분리돼 있어 서로
// 안 건드림. 새 프로젝트 슬롯이 나면 pg_dump로 다시 빼낼 것(health-shorts
// CLAUDE.md에 이 이전 사실 기록 예정).
export const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
  db: { schema: "ori" },
});

export const PHOTOS_BUCKET = "photos";
