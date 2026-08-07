// 참가자 상세 — 설문 이력 + 운영자 메모(참가자 CRM)
import { repository } from "@/lib/repository";
import type { ParticipantNote, SurveyResponse } from "@/lib/types";
import NoteForm from "./note-form";
import { Bilingual, BilingualInline } from "@/components/bilingual";

async function loadParticipant(
  name: string
): Promise<
  | { ok: true; responses: SurveyResponse[]; notes: ParticipantNote[] }
  | { ok: false }
> {
  try {
    const [allResponses, notes] = await Promise.all([
      repository.listSurveyResponses(),
      repository.listNotesByParticipant(name),
    ]);
    const responses = allResponses.filter((r) => r.participantName === name);
    return { ok: true, responses, notes };
  } catch (error) {
    console.error("참가자 상세 데이터 로드 실패", error);
    return { ok: false };
  }
}

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: rawName } = await params;
  const name = decodeURIComponent(rawName);
  const data = await loadParticipant(name);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{name}</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          参加者詳細 <span className="text-xs opacity-70">(참가자 상세)</span>
        </span>
      </div>

      {!data.ok && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          参加者情報の読み込み中に問題が発生しました。しばらくしてから再度お試しください。
          <span className="block text-xs opacity-80">
            참가자 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </span>
        </p>
      )}

      {data.ok && (
        <>
          <section aria-labelledby="responses-heading" className="flex flex-col gap-3">
            <Bilingual
              as="h2"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              jp={<span id="responses-heading">アンケート履歴</span>}
              kr="설문 이력"
            />
            {data.responses.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                アンケート回答履歴がありません。
                <span className="block text-xs opacity-80">설문 응답 이력이 없습니다.</span>
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.responses.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {r.contact && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          <BilingualInline jp="連絡先" kr="연락처" />: {r.contact}
                        </p>
                      )}
                      <time dateTime={r.submittedAt} className="text-xs text-zinc-400">
                        {new Date(r.submittedAt).toLocaleString("ko-KR")}
                      </time>
                    </div>
                    <dl className="mt-2 flex flex-col gap-1">
                      {Object.entries(r.answers).map(([key, value]) => (
                        <div key={key} className="flex gap-2 text-sm">
                          <dt className="font-medium text-zinc-700 dark:text-zinc-200">{key}</dt>
                          <dd className="text-zinc-600 dark:text-zinc-300">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="notes-heading" className="flex flex-col gap-4">
            <Bilingual
              as="h2"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              jp={<span id="notes-heading">メモ</span>}
              kr="운영자 메모"
            />
            {data.notes.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                登録されたメモはありません。
                <span className="block text-xs opacity-80">등록된 메모가 없습니다.</span>
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.notes.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">{n.note}</p>
                    {n.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {n.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <time dateTime={n.createdAt} className="mt-2 block text-xs text-zinc-400">
                      {new Date(n.createdAt).toLocaleString("ko-KR")}
                    </time>
                  </li>
                ))}
              </ul>
            )}

            <NoteForm participantName={name} />
          </section>
        </>
      )}
    </div>
  );
}
