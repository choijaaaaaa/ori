"use client";

// 등록된 이벤트 카드 목록 — 카드별 수정(인라인 폼 펼치기)/삭제 버튼 제공.
import { useState } from "react";
import type { EventPost, Photo } from "@/lib/types";
import { BilingualInline } from "@/components/bilingual";
import EventForm from "./event-form";
import DeleteEventButton from "./delete-event-button";

type EventWithApplicants = EventPost & { activeApplicants: number };

export default function EventList({
  events,
  photos,
  recentVenueMapUrl,
  recentVenueImageUrl,
  recentVenueInfo,
}: {
  events: EventWithApplicants[];
  photos: Photo[];
  recentVenueMapUrl?: string;
  recentVenueImageUrl?: string;
  recentVenueInfo?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {events.map((item) => {
        const isEditing = editingId === item.id;

        if (isEditing) {
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

        return (
          <li
            key={item.id}
            className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {item.coverPhotoUrl ? (
              <img
                src={item.coverPhotoUrl}
                alt={item.title}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-xl dark:bg-zinc-800">
                🦆
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {item.eventDate && (
                    <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      {item.eventDate}
                    </span>
                  )}
                  {item.closed && (
                    <span className="w-fit rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                      <BilingualInline jp="締切中" kr="마감중" />
                    </span>
                  )}
                  {item.capacity != null && (
                    <span className="w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <BilingualInline jp={`定員${item.capacity}名`} kr={`정원 ${item.capacity}명`} />
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    aria-label="イベント編集 / 이벤트 수정"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <BilingualInline jp="編集" kr="수정" />
                  </button>
                  <DeleteEventButton eventId={item.id} />
                </div>
              </div>
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</p>
              <p className="line-clamp-2 whitespace-pre-line text-xs text-zinc-500 dark:text-zinc-400">
                {item.content}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.capacity != null ? (
                  <BilingualInline
                    jp={`${item.capacity}名中${item.activeApplicants}名申込`}
                    kr={`${item.capacity}명 중 ${item.activeApplicants}명 신청`}
                  />
                ) : (
                  <BilingualInline
                    jp={`申込${item.activeApplicants}名`}
                    kr={`신청 ${item.activeApplicants}명`}
                  />
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
