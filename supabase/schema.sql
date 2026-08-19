create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  event_date date,
  cover_photo_url text,
  venue_map_url text,
  venue_image_url text,
  venue_info text,
  capacity integer,
  closed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  participant_name text not null,
  contact text,
  answers jsonb not null default '{}'::jsonb,
  event_id uuid references events(id) on delete set null,
  submitted_at timestamptz not null default now()
);
create index if not exists survey_responses_event_id_idx on survey_responses (event_id);

create table if not exists participant_notes (
  id uuid primary key default gen_random_uuid(),
  participant_name text not null,
  note text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists participant_notes_name_idx on participant_notes (participant_name);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  message text,
  event_id uuid references events(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','attended','cancelled')),
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);
create index if not exists applications_event_id_idx on applications (event_id);

-- 참가 신청 폼 항목(이름/희망 회차 제외) — 관리자가 추가/삭제/순서변경 가능한 동적 폼 필드.
create table if not exists apply_form_fields (
  id uuid primary key default gen_random_uuid(),
  field_key text not null unique,
  type text not null check (type in ('text','textarea','radio_group','checkbox_group','checkbox','image')),
  label_jp text not null,
  label_kr text not null default '',
  help_jp text not null default '',
  help_kr text not null default '',
  options jsonb not null default '[]'::jsonb,
  required boolean not null default false,
  require_all boolean not null default false,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists apply_form_fields_sort_order_idx on apply_form_fields (sort_order);

create table if not exists admin_auth (
  id int primary key default 1,
  password_hash text not null,
  salt text not null,
  constraint admin_auth_singleton check (id = 1)
);

create table if not exists site_texts (
  key text primary key,
  value_jp text not null default '',
  value_kr text not null default '',
  updated_at timestamptz not null default now()
);

-- "Staff 소개" 팝업에 보여줄 운영진 소개 카드 — 관리자가 추가/수정/삭제/순서변경 가능.
create table if not exists staff_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  bio text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists staff_members_sort_order_idx on staff_members (sort_order);

alter table events enable row level security;
alter table photos enable row level security;
alter table survey_responses enable row level security;
alter table participant_notes enable row level security;
alter table applications enable row level security;
alter table admin_auth enable row level security;
alter table site_texts enable row level security;
alter table apply_form_fields enable row level security;
alter table staff_members enable row level security;
-- 서버(Route Handler)에서 service_role 키로만 접근하므로 별도 정책 없이 RLS로 기본 차단.
