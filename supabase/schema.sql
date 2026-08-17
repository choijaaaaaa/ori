create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  event_date date,
  cover_photo_url text,
  venue_info text,
  capacity integer,
  closed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
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
  submitted_at timestamptz not null default now()
);
create index if not exists applications_event_id_idx on applications (event_id);

create table if not exists admin_auth (
  id int primary key default 1,
  password_hash text not null,
  salt text not null,
  constraint admin_auth_singleton check (id = 1)
);

alter table events enable row level security;
alter table photos enable row level security;
alter table survey_responses enable row level security;
alter table participant_notes enable row level security;
alter table applications enable row level security;
alter table admin_auth enable row level security;
-- 서버(Route Handler)에서 service_role 키로만 접근하므로 별도 정책 없이 RLS로 기본 차단.
