# ori

일한교류회(日韓交流会) 운영을 위한 웹앱. 이벤트(교류회 회차) 카드 공개(정원/마감 지원), 참가 신청(QR로 설문 연결, 회차별 상태 관리), 설문 접수(회차 연결), 관리자 전용 참가자 통합 CRM(신청 이력 + 설문 이력 + 메모)을 제공한다.

## 데이터 저장

Supabase(Postgres + Storage)를 사용한다. `src/lib/repository.ts`의 `DataRepository` 인터페이스를 `src/lib/supabase-repository.ts`(`SupabaseRepository`)가 구현하며, 관리자 비밀번호는 `admin_auth` 테이블, 사진/이벤트 대표사진은 `ori-photos` Storage 버킷(공개)에 업로드된다. 스키마는 `supabase/schema.sql`에 있다.

⚠️ **현재 ori 전용 Supabase 프로젝트가 아니라 health-shorts 프로젝트 안의 `ori` 스키마(`db.schema: "ori"`, `src/lib/supabase.ts`)에 얹혀 있다** — 무료 티어 2프로젝트 한계 때문(2026-08-13, 자세한 내용은 `CLAUDE.md`). Storage 버킷은 스키마가 아니라 프로젝트 단위라서 이 이전 때 버킷이 함께 안 옮겨져 업로드가 깨져 있었고(2026-08-17 발견·수정), health-shorts와 이름이 겹치지 않게 `ori-photos`로 새로 만들었다. 원래 ori 전용 프로젝트 자격증명은 `.env.supabase-cli`에 남아있다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

## 환경변수

| 이름 | 설명 |
|---|---|
| `ADMIN_PASSWORD` | 최초 관리자 비밀번호. `admin_auth` 테이블이 비어있을 때만 초기화에 사용되고, 이후엔 관리자 설정 화면에서 변경한 해시값이 우선한다. |
| `ADMIN_SESSION_SECRET` | 관리자 세션 쿠키 서명용 비밀키. 운영 배포 전 반드시 임의의 긴 문자열로 교체. |
| `ADMIN_NOTIFY_EMAIL` | 참가 신청·설문 제출 시 알림을 받을 이메일. 지금은 실제 발송 없이 로그만 남기는 스텁(`src/lib/notify.ts`)이고, 추후 실제 이메일 서비스 연동 지점. |
| `SUPABASE_URL` | Supabase 프로젝트 URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role 키. 서버(Route Handler/서버 컴포넌트)에서만 쓰고 클라이언트로 절대 넘기지 않는다. |

## 참가 흐름

홈 화면에는 설문 링크를 직접 노출하지 않는다. `참가 신청(/apply)` → 접수 완료 시 관리자에게 알림(mock) + QR 코드 표시 → QR을 스캔하면 `/survey`로 이동해 실제 설문 작성 → 관리자는 `/admin/surveys`, `/admin/applications`에서 확인.

## 구조

- `/` — 소개, 오시는 길, 이벤트 카드, 사진 갤러리 (공개)
- `/apply` — 참가 신청 폼, 제출 후 설문 페이지로 연결되는 QR 코드 표시 (공개)
- `/survey` — 참가자 설문 폼, 신청 후 QR로만 안내 (공개)
- `/events/[id]` — 이벤트 상세(내용 + 오시는 길) (공개)
- `/admin/login` — 관리자 로그인 (비밀번호 단일 인증)
- `/admin` — 대시보드
- `/admin/applications` — 참가 신청 내역(이벤트별 그룹, 상태 변경: 대기/확정/참석/취소)
- `/admin/events` — 이벤트 관리 (대표사진은 갤러리 선택 또는 로컬 업로드, 정원/마감 설정)
- `/admin/photos` — 사진 갤러리 관리 (로컬 업로드)
- `/admin/surveys` — 설문 응답 목록 (이름 검색)
- `/admin/participants/[name]` — 참가자별 신청 이력 + 설문 이력 + 메모(CRM)
- `/admin/settings` — 관리자 비밀번호 변경 + 사이트 문구 편집(참가 신청 페이지 안내문 등, 일본어+한국어 둘 다 관리자가 직접 입력)

## 배포 (Vercel)

1. GitHub `ori` 저장소에 push
2. Vercel에서 해당 저장소 Import
3. 환경변수(`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_NOTIFY_EMAIL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)를 Vercel 프로젝트 설정에 등록
4. Deploy

## Supabase 스키마 적용

`supabase/schema.sql`을 Supabase 프로젝트의 SQL Editor(또는 Management API)에서 실행하면 테이블이 만들어진다. `ori-photos`라는 이름의 공개 Storage 버킷도 별도로 만들어야 한다(대시보드 Storage 탭 또는 API로 생성, `public: true`).

## 다음 단계

- `src/lib/notify.ts`를 실제 이메일 서비스(Resend 등) 연동으로 교체
- 필요 시 관리자 인증을 Supabase Auth로 전환(지금은 단일 비밀번호 해시 방식)
- 사이트 문구(`site_texts` 테이블) 자동 번역 — 이메일과 마찬가지로 외부 번역 API 키가 필요해 보류. 지금은 관리자가 일본어/한국어를 각각 직접 입력.
