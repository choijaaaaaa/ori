import { createClient } from "@supabase/supabase-js";

// 서버 전용 클라이언트. service_role 키를 쓰므로 RLS를 우회한다 —
// 이 클라이언트는 Route Handler/서버 컴포넌트에서만 쓰고 브라우저로 절대 넘기지 않는다.
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되어 있지 않습니다.");
}

export const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

export const PHOTOS_BUCKET = "photos";
