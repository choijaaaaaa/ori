"use client";

// 홈 화면 "모임 일정(イベント一覧)" 섹션 — 관리자 로그인 상태면 별도 관리자 페이지로 이동하지
// 않고 이 자리에서 바로 이벤트를 드래그로 순서변경/수정/삭제/추가할 수 있다.
// apply-form.tsx의 인라인 편집 패턴(sortedFields/드래그/편집·추가 토글)을 그대로 이식.
import { useEffect, useState, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import EventForm from "@/app/admin/events/event-form";
import DeleteEventButton from "@/app/admin/events/delete-event-button";
import type { EventPost, Photo } from "@/lib/types";

export default function HomeEventsSection({
  events,
  photos,
  isAdmin,
  recentVenueMapUrl,
  recentVenueImageUrl,
  recentVenueInfo,
}: {
  events: EventPost[];
  photos: Photo[];
  isAdmin: boolean;
  recentVenueMapUrl?: string;
  recentVenueImageUrl?: string;
  recentVenueInfo?: string;
}) {
  const router = useRouter();

  const [sortedEvents, setSortedEvents] = useState(() =>
    [...events].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  useEffect(() => {
    setSortedEvents([...events].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [events]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  function handleDragStart(id: string) {
    setDragId(id);
    setOverId(id);
  }

  // dragover는 같은 요소 위에 머무는 동안에도 계속 반복 발생한다. 여기서 배열을 매번
  // 재배열하면 드래그 도중 DOM이 계속 움직여 커서 아래 요소가 바뀌고, 그게 다시 dragover를
  // 유발해 무한히 재배열되는 피드백 루프가 생긴다 — 그래서 hover 대상만 추적하고, 실제 배열
  // 재배열은 drop 시점에 한 번만 한다.
  function handleDragOver(event: DragEvent<HTMLLIElement>, targetId: string) {
    event.preventDefault();
    if (!dragId || dragId === targetId) return;
    if (overId !== targetId) setOverId(targetId);
  }

  async function handleDrop(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    const fromId = dragId;
    const toId = overId;
    setDragId(null);
    setOverId(null);
    if (!fromId || !toId || fromId === toId) return;

    const reordered = (() => {
      const fromIndex = sortedEvents.findIndex((item) => item.id === fromId);
      const toIndex = sortedEvents.findIndex((item) => item.id === toId);
      if (fromIndex === -1 || toIndex === -1) return sortedEvents;
      const next = [...sortedEvents];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    })();
    setSortedEvents(reordered);

    setAdminError(null);
    setIsSavingOrder(true);
    try {
      const res = await fetch("/api/events/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((e) => e.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "순서 변경에 실패했습니다.");
      }
      router.refresh();
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "네트워크 오류로 순서 변경에 실패했습니다.");
      router.refresh();
    } finally {
      setIsSavingOrder(false);
    }
  }

  return (
    <section aria-labelledby="events-heading" className="flex flex-col gap-4">
      <Bilingual
        as="h2"
        jp={
          <span id="events-heading" className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            イベント一覧
          </span>
        }
        kr="모임 일정"
      />

      {isAdmin && (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <BilingualInline
            jp="管理者モード：イベントをドラッグして並び替え、編集・削除・追加ができます。"
            kr="관리자 모드: 이벤트를 드래그해서 순서를 바꾸고, 편집·삭제·추가할 수 있습니다."
          />
          {adminError && <p className="mt-1 text-red-600 dark:text-red-400">{adminError}</p>}
          {isSavingOrder && (
            <p className="mt-1 opacity-80">
              <BilingualInline jp="並び順を保存中..." kr="순서 저장 중..." />
            </p>
          )}
        </div>
      )}

      {sortedEvents.length === 0 && !isAdmin ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <BilingualInline jp="予定されているイベントはまだありません。" kr="예정된 모임이 아직 없습니다." />
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sortedEvents.map((item) => {
            if (isAdmin && editingId === item.id) {
              return (
                <li key={item.id} className="sm:col-span-2">
                  <EventForm
                    photos={photos}
                    editingEvent={item}
                    onDone={() => setEditingId(null)}
                    recentVenueMapUrl={recentVenueMapUrl}
                    recentVenueImageUrl={recentVenueImageUrl}
                    recentVenueInfo={recentVenueInfo}
                  />
                </li>
              );
            }

            const card = (
              <div className="flex flex-col overflow-hidden rounded-xl border border-amber-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                {item.coverPhotoUrl ? (
                  <img
                    src={item.coverPhotoUrl}
                    alt={item.title}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-amber-100 text-3xl dark:bg-zinc-800">
                    🦆
                  </div>
                )}
                <div className="flex flex-col gap-1 px-5 py-4">
                  {item.eventDate && (
                    <span className="w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      {new Date(item.eventDate).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h3>
                  <p className="line-clamp-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-300">
                    {item.content}
                  </p>
                </div>
              </div>
            );

            if (!isAdmin) {
              return (
                <li key={item.id}>
                  <Link href={`/events/${item.id}`}>{card}</Link>
                </li>
              );
            }

            return (
              <li
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={handleDrop}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                className={`flex flex-col gap-1.5 rounded-xl border-2 border-dashed p-2 transition-opacity ${
                  dragId === item.id
                    ? "border-transparent opacity-50"
                    : overId === item.id
                      ? "border-amber-400"
                      : "border-transparent hover:border-amber-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span aria-hidden className="cursor-grab select-none text-zinc-400">
                      ⠿
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      className="rounded-full border border-zinc-300 px-2 py-0.5 font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <BilingualInline jp="編集" kr="수정" />
                    </button>
                  </div>
                  <DeleteEventButton eventId={item.id} />
                </div>
                <Link href={`/events/${item.id}`}>{card}</Link>
              </li>
            );
          })}
        </ul>
      )}

      {isAdmin &&
        (isAdding ? (
          <EventForm
            photos={photos}
            recentVenueMapUrl={recentVenueMapUrl}
            recentVenueImageUrl={recentVenueImageUrl}
            recentVenueInfo={recentVenueInfo}
            onDone={() => setIsAdding(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-fit rounded-full border border-amber-300 px-4 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
          >
            <BilingualInline jp="+ イベントを追加" kr="+ 항목 추가" />
          </button>
        ))}
    </section>
  );
}
