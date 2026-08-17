@AGENTS.md

## Supabase — 임시로 health-shorts 프로젝트에 얹혀 있음 (2026-08-13)

⚠️ **`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`(`.env.local`, Vercel 배포
환경변수 둘 다)가 ori 전용 프로젝트가 아니라 `../health-shorts`의 Supabase
프로젝트를 가리킨다** — Supabase 무료 티어 2프로젝트 한계 때문에 임시로
health-shorts 프로젝트 안 `ori` 스키마(public 아님)에 데이터를 옮겨뒀음.
`src/lib/supabase.ts`의 `db: { schema: "ori" }` 설정이 이걸 가능하게 함.
health-shorts 쪽 테이블(public 스키마)과는 완전히 분리돼 있어 서로 안
건드림. 원래 ori 전용 Supabase 프로젝트 자격증명은 `.env.supabase-cli`에
그대로 남아있음(프로젝트 자체는 아직 안 지워짐 — 확인 후 삭제 여부는
사용자 결정).

**되돌리는 법(새 Supabase 프로젝트 슬롯이 생기면)**: `ori` 스키마 6개
테이블(admin_auth/events/applications/participant_notes/photos/
survey_responses)을 새 프로젝트의 `public` 스키마로 pg_dump 후,
`src/lib/supabase.ts`의 `db: { schema: "ori" }` 제거, `.env.local`/Vercel
환경변수를 새 프로젝트 값으로 교체.
