"use client";

// 공개 페이지 우상단에 떠 있는 관리자 접근 버튼.
// 미로그인 상태: 로그인 페이지로 이동. 로그인 상태: 관리자 페이지 새 탭 열기 + 미리보기 버튼.
// 미리보기 상태: 로그아웃하지 않고도 방문자 화면 그대로 볼 수 있게 편집 UI를 숨긴 상태 —
// "관리자로 돌아가기" 버튼만 떠서 원래대로 되돌릴 수 있다.
// /admin/* 경로에서는 자체 사이드바+로그아웃 UI가 이미 있으므로 숨긴다.
//
// 미리보기 토글은 /api/preview-mode 서버 라우트로 쿠키를 설정한다(Set-Cookie) —
// 예전엔 document.cookie를 클라이언트에서 직접 썼는데, 모바일에서 "눌러도 반응이
// 없다"는 제보로 더 확실한 서버 왕복 방식으로 교체(로딩 상태로 탭이 실제 처리
// 중인지도 눈에 보이게 함).
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BilingualInline } from "./bilingual";

async function setPreviewMode(enabled: boolean) {
  await fetch("/api/preview-mode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
}

export function AdminAccessButton({
  authenticated,
  previewMode,
}: {
  authenticated: boolean;
  previewMode: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  if (pathname?.startsWith("/admin")) return null;

  async function handleToggle(enabled: boolean) {
    setIsToggling(true);
    try {
      await setPreviewMode(enabled);
      router.refresh();
    } finally {
      setIsToggling(false);
    }
  }

  if (authenticated && previewMode) {
    return (
      <div className="fixed right-3 top-3 z-50 max-w-[calc(100vw-1.5rem)] sm:right-4 sm:top-4">
        <button
          type="button"
          onClick={() => handleToggle(false)}
          disabled={isToggling}
          aria-label="プレビューを終了して管理者モードに戻る / 미리보기를 끝내고 관리자 모드로 돌아가기"
          className="inline-flex items-center justify-center rounded-full bg-zinc-700 px-3 py-1.5 text-[11px] leading-tight text-white shadow-md transition-colors hover:bg-zinc-800 disabled:opacity-60 sm:px-4 sm:py-2 sm:text-xs"
        >
          {isToggling ? (
            <BilingualInline jp="処理中..." kr="처리 중..." />
          ) : (
            <BilingualInline jp="プレビュー中・戻る" kr="미리보기 중 · 돌아가기" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-3 top-3 z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-1.5 sm:right-4 sm:top-4 sm:flex-row sm:items-center sm:gap-2">
      {authenticated && (
        <button
          type="button"
          onClick={() => handleToggle(true)}
          disabled={isToggling}
          aria-label="訪問者の画面をプレビュー / 방문자 화면 미리보기"
          className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] text-amber-700 shadow-md transition-colors hover:bg-amber-50 disabled:opacity-60 dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-300 dark:hover:bg-amber-950/40 sm:px-4 sm:py-2 sm:text-xs"
        >
          {isToggling ? (
            <BilingualInline jp="処理中..." kr="처리 중..." />
          ) : (
            <BilingualInline jp="プレビュー" kr="미리보기" />
          )}
        </button>
      )}
      {authenticated ? (
        <a
          href="/admin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="管理者ページを新しいタブで開く / 관리자 페이지를 새 탭으로 열기"
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-3 py-1.5 text-[11px] text-white shadow-md transition-colors hover:bg-amber-700 sm:px-4 sm:py-2 sm:text-xs"
        >
          <BilingualInline jp="管理者ページ" kr="관리자 페이지" />
        </a>
      ) : (
        <a
          href="/admin/login"
          aria-label="管理者ログイン / 관리자 로그인"
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-3 py-1.5 text-[11px] text-white shadow-md transition-colors hover:bg-amber-700 sm:px-4 sm:py-2 sm:text-xs"
        >
          <BilingualInline jp="管理者ログイン" kr="관리자 로그인" />
        </a>
      )}
    </div>
  );
}
