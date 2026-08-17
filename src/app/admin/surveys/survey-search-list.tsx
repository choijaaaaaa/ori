// 설문 응답 목록 + 참가자 이름 검색 (클라이언트 컴포넌트)
"use client";

import Link from "next/link";
import { useState } from "react";
import type { SurveyResponse } from "@/lib/types";
import { BilingualInline } from "@/components/bilingual";

function summarizeAnswers(answers: Record<string, string>): string {
  const entries = Object.entries(answers);
  if (entries.length === 0) return "-";
  return entries.map(([key, value]) => `${key}: ${value}`).join(" · ");
}

export default function SurveySearchList({ responses }: { responses: SurveyResponse[] }) {
  const [query, setQuery] = useState("");

  const filtered = responses.filter((r) =>
    r.participantName.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="お名前で検索 / 이름으로 검색"
        aria-label="お名前で検索 / 이름으로 검색"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          該当するアンケート回答がありません。
          <span className="block text-xs opacity-80">일치하는 설문 응답이 없습니다.</span>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/admin/participants/${encodeURIComponent(r.participantName)}`}
                  className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                  aria-label={`${r.participantName} — お名前 / 이름`}
                >
                  {r.participantName}
                </Link>
                <time dateTime={r.submittedAt} className="text-xs text-zinc-400">
                  <BilingualInline jp="送信日" kr="제출일" />:{" "}
                  {new Date(r.submittedAt).toLocaleString("ja-JP")}
                </time>
              </div>
              {r.contact && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <BilingualInline jp="連絡先" kr="연락처" />: {r.contact}
                </p>
              )}
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                <BilingualInline jp="回答" kr="답변" />: {summarizeAnswers(r.answers)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
