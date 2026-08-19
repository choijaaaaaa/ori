"use client";

// 홈 화면 "소개" 섹션 — 관리자 로그인 시 그 자리에서 바로 수정/삭제할 수 있다.
// site_texts(about_intro)를 비워서 저장하면 "삭제"로 취급해 섹션 자체가 숨겨진다.
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { ABOUT_INTRO_KEY } from "@/lib/site-text-defaults";
import { useAutoTranslate } from "@/lib/use-auto-translate";
import HomeStaffSection from "./home-staff-section";
import type { StaffMember } from "@/lib/types";

export default function HomeAboutSection({
  initialJp,
  initialKr,
  isAdmin,
  staffMembers,
}: {
  initialJp: string;
  initialKr: string;
  isAdmin: boolean;
  staffMembers: StaffMember[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [jp, setJp] = useState(initialJp);
  const [kr, setKr] = useState(initialKr);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { translate, isTranslating, error: translateError } = useAutoTranslate();

  async function handleAutoTranslate() {
    const result = await translate(jp);
    if (result !== null) setKr(result);
  }

  // 일본어 입력을 마치고 다른 곳을 클릭하면 자동으로 번역해서 한국어를 최신 상태로 맞춘다.
  function handleJpBlur() {
    if (jp.trim()) handleAutoTranslate();
  }

  // 방문자에게는 내용이 없으면 섹션 자체를 아예 숨긴다.
  if (!isAdmin && !initialJp) return null;

  async function save(nextJp: string, nextKr: string) {
    setError(null);
    try {
      const res = await fetch(`/api/site-text/${ABOUT_INTRO_KEY}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valueJp: nextJp, valueKr: nextKr }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "저장에 실패했습니다.");
      }
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류로 저장에 실패했습니다.");
      return false;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const ok = await save(jp.trim(), kr.trim());
    setIsSaving(false);
    if (ok) setIsEditing(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "本当に削除しますか？セクション自体が非表示になります。\n정말 삭제하시겠습니까? 섹션 자체가 안 보이게 됩니다."
    );
    if (!confirmed) return;
    setIsDeleting(true);
    await save("", "");
    setIsDeleting(false);
  }

  if (isEditing) {
    return (
      <section className="flex flex-col gap-4">
        <Bilingual
          as="h2"
          jp={<span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">団体紹介</span>}
          kr="소개"
        />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <BilingualInline jp="紹介文（日本語）" kr="소개 (일본어)" />
            </label>
            <textarea
              value={jp}
              onChange={(e) => setJp(e.target.value)}
              onBlur={handleJpBlur}
              rows={4}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <BilingualInline jp="紹介文（韓国語）" kr="소개 (한국어)" />
              </label>
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={isTranslating || !jp.trim()}
                className="rounded-full border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
              >
                {isTranslating ? (
                  <BilingualInline jp="翻訳中..." kr="번역 중..." />
                ) : (
                  <BilingualInline jp="日本語から自動翻訳" kr="일본어에서 자동 번역" />
                )}
              </button>
            </div>
            <textarea
              value={kr}
              onChange={(e) => setKr(e.target.value)}
              rows={4}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            {translateError && <p className="text-xs text-red-600 dark:text-red-400">{translateError}</p>}
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
            >
              {isSaving ? <BilingualInline jp="保存中..." kr="저장 중..." /> : <BilingualInline jp="保存する" kr="저장하기" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setJp(initialJp);
                setKr(initialKr);
                setError(null);
                setIsEditing(false);
              }}
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <BilingualInline jp="キャンセル" kr="취소" />
            </button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section aria-labelledby="about-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Bilingual
          as="h2"
          jp={
            <span id="about-heading" className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              団体紹介
            </span>
          }
          kr="소개"
        />
        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <BilingualInline jp="編集" kr="수정" />
              </button>
              {initialJp && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                >
                  {isDeleting ? <BilingualInline jp="削除中..." kr="삭제 중..." /> : <BilingualInline jp="削除" kr="삭제" />}
                </button>
              )}
            </>
          )}
          <HomeStaffSection staffMembers={staffMembers} isAdmin={isAdmin} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {initialJp ? (
        <Bilingual
          as="div"
          className="rounded-xl border border-amber-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          jp={<p className="whitespace-pre-wrap text-sm leading-7 text-zinc-600 dark:text-zinc-300">{initialJp}</p>}
          kr={<p className="mt-2 whitespace-pre-wrap text-sm leading-7">{initialKr}</p>}
        />
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          <BilingualInline jp="紹介文はまだありません。" kr="아직 등록된 소개 문구가 없습니다." />
        </p>
      )}
    </section>
  );
}
