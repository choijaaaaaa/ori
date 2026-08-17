// 관리자 전용 참가 신청 내역 — 이벤트(회차)별로 그룹핑해서 보여준다
import Link from "next/link";
import { repository } from "@/lib/repository";
import type { Application, ApplicationStatus, EventPost } from "@/lib/types";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import StatusSelect from "./status-select";
import CsvDownloadButton from "./csv-download-button";

// 관리자가 추가한 데이터가 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
export const dynamic = "force-dynamic";

async function loadData(): Promise<
  { ok: true; applications: Application[]; events: EventPost[] } | { ok: false }
> {
  try {
    const [applications, events] = await Promise.all([
      repository.listApplications(),
      repository.listEvents(),
    ]);
    return { ok: true, applications, events };
  } catch (error) {
    console.error("신청 내역 로드 실패", error);
    return { ok: false };
  }
}

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  pending: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  attended: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const STATUS_BADGE_LABEL: Record<ApplicationStatus, { jp: string; kr: string }> = {
  pending: { jp: "保留中", kr: "대기중" },
  confirmed: { jp: "確定", kr: "확정" },
  attended: { jp: "参加済み", kr: "참석완료" },
  cancelled: { jp: "キャンセル", kr: "취소" },
};

function ApplicationCard({ a }: { a: Application }) {
  return (
    <li className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/participants/${encodeURIComponent(a.name)}`}
            className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
            aria-label={`${a.name} — お名前 / 이름`}
          >
            {a.name}
          </Link>
          <span
            className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[a.status]}`}
          >
            <BilingualInline jp={STATUS_BADGE_LABEL[a.status].jp} kr={STATUS_BADGE_LABEL[a.status].kr} />
          </span>
        </div>
        <time dateTime={a.submittedAt} className="text-xs text-zinc-400">
          <BilingualInline jp="申込日" kr="신청일" />: {new Date(a.submittedAt).toLocaleString("ja-JP")}
        </time>
      </div>
      <div className="mt-2">
        <StatusSelect applicationId={a.id} currentStatus={a.status} />
      </div>
      {a.contact && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          <BilingualInline jp="連絡先" kr="연락처" />: {a.contact}
        </p>
      )}
      {a.message && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
          <BilingualInline jp="申し込み内容" kr="신청 내용" />: {a.message}
        </p>
      )}
    </li>
  );
}

export default async function AdminApplicationsPage() {
  const data = await loadData();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Bilingual
          as="h1"
          className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
          jp="申し込み一覧"
          kr="신청 내역"
        />
        {data.ok && <CsvDownloadButton applications={data.applications} events={data.events} />}
      </div>

      {!data.ok && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          申し込み内容の読み込み中に問題が発生しました。しばらくしてから再度お試しください。
          <span className="block text-xs opacity-80">
            신청 내역을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </span>
        </p>
      )}

      {data.ok && data.applications.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          まだ申し込みはありません。
          <span className="block text-xs opacity-80">아직 접수된 신청이 없습니다.</span>
        </p>
      )}

      {data.ok && data.applications.length > 0 && (
        <div className="flex flex-col gap-8">
          {data.events.map((event) => {
            const applicants = data.applications.filter((a) => a.eventId === event.id);
            if (applicants.length === 0) return null;
            return (
              <section key={event.id} aria-labelledby={`event-${event.id}-heading`} className="flex flex-col gap-3">
                <h2
                  id={`event-${event.id}-heading`}
                  className="flex flex-wrap items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  {event.eventDate && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      {event.eventDate}
                    </span>
                  )}
                  {event.title}
                  <span className="text-sm font-normal text-zinc-400">
                    ({applicants.length}
                    <BilingualInline jp="名" kr="명" />)
                  </span>
                </h2>
                <ul className="flex flex-col gap-3">
                  {applicants.map((a) => (
                    <ApplicationCard key={a.id} a={a} />
                  ))}
                </ul>
              </section>
            );
          })}

          {(() => {
            const eventIds = new Set(data.events.map((e) => e.id));
            const unassigned = data.applications.filter(
              (a) => !a.eventId || !eventIds.has(a.eventId)
            );
            if (unassigned.length === 0) return null;
            return (
              <section aria-labelledby="unassigned-heading" className="flex flex-col gap-3">
                <h2 id="unassigned-heading" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  <BilingualInline jp="回未指定" kr="회차 미지정" />
                  <span className="ml-2 text-sm font-normal text-zinc-400">
                    ({unassigned.length}
                    <BilingualInline jp="名" kr="명" />)
                  </span>
                </h2>
                <ul className="flex flex-col gap-3">
                  {unassigned.map((a) => (
                    <ApplicationCard key={a.id} a={a} />
                  ))}
                </ul>
              </section>
            );
          })()}
        </div>
      )}
    </div>
  );
}
