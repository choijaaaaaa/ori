# ori

한일교류회 운영을 위한 웹앱. 공지/사진 갤러리 공개, 참가자 설문 접수, 관리자 전용 참가자 CRM(설문 이력 + 메모)을 제공한다.

## 현재 단계: mock

데이터는 `data/*.json` 파일로 저장된다. `src/lib/repository.ts`의 `DataRepository` 인터페이스만 유지한 채 나중에 Supabase 구현체로 교체할 예정이다. Vercel 같은 서버리스 환경에서는 배포마다 파일시스템이 초기화되므로, 이 mock 단계에서 관리자가 작성한 데이터(공지, 사진, 설문 응답, 메모, 변경한 비밀번호)는 영구 저장되지 않는다 — 데모/검증용.

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

## 환경변수

| 이름 | 설명 |
|---|---|
| `ADMIN_PASSWORD` | 최초 관리자 비밀번호. `data/admin-auth.json`이 비어있을 때만 초기화에 사용되고, 이후엔 관리자 설정 화면에서 변경한 해시값이 우선한다. |
| `ADMIN_SESSION_SECRET` | 관리자 세션 쿠키 서명용 비밀키. 운영 배포 전 반드시 임의의 긴 문자열로 교체. |
| `ADMIN_NOTIFY_EMAIL` | 설문 제출 시 알림을 받을 이메일. 지금은 실제 발송 없이 로그만 남기는 스텁(`src/lib/notify.ts`)이고, 추후 실제 이메일 서비스 연동 지점. |

## 구조

- `/` — 공지사항 + 사진 갤러리 (공개)
- `/survey` — 참가자 설문 폼 (공개)
- `/admin/login` — 관리자 로그인 (비밀번호 단일 인증)
- `/admin` — 대시보드
- `/admin/announcements`, `/admin/photos` — 공지/사진 관리
- `/admin/surveys` — 설문 응답 목록
- `/admin/participants/[name]` — 참가자별 설문 이력 + 메모(CRM)
- `/admin/settings` — 관리자 비밀번호 변경

## 배포 (Vercel)

1. GitHub `ori` 저장소에 push
2. Vercel에서 해당 저장소 Import
3. 환경변수(`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_NOTIFY_EMAIL`)를 Vercel 프로젝트 설정에 등록
4. Deploy

## 다음 단계 (Supabase 연동 시)

- `src/lib/repository.ts`의 `JsonFileRepository`를 대체하는 `SupabaseRepository` 구현체 추가 (동일한 `DataRepository` 인터페이스 구현)
- 관리자 비밀번호/세션을 Supabase Auth로 교체
- 사진 업로드를 URL 입력 방식에서 Supabase Storage 실제 업로드로 교체
- `src/lib/notify.ts`를 실제 이메일 서비스(Resend 등) 연동으로 교체
