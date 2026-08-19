"use client";

// 공개 페이지 우상단에 떠 있는 관리자 접근 버튼.
// 미로그인 상태: 로그인 페이지로 이동. 로그인 상태: 관리자 페이지 새 탭 열기 + 미리보기 버튼.
// 미리보기 상태: 로그아웃하지 않고도 방문자 화면 그대로 볼 수 있게 편집 UI를 숨긴 상태 —
// "관리자로 돌아가기" 버튼만 떠서 원래대로 되돌릴 수 있다.
// /admin/* 경로에서는 자체 사이드바+로그아웃 UI가 이미 있으므로 숨긴다.
import { usePathname, useRouter } from "next/navigation";
import { BilingualInline } from "./bilingual";

// src/lib/preview-mode.ts의 PREVIEW_MODE_COOKIE와 반드시 같은 이름이어야 한다.
// (그 파일은 next/headers를 써서 서버 전용이라 클라이언트 컴포넌트에서 import할 수 없다.)
const PREVIEW_MODE_COOKIE = "ori_preview_mode";

function setPreviewCookie(enabled: boolean) {
  const maxAge = enabled ? 60 * 60 * 24 * 30 : 0; // 켤 때 30일, 끌 때 즉시 만료
  document.cookie = `${PREVIEW_MODE_COOKIE}=${enabled ? "1" : ""}; path=/; max-age=${maxAge}`;
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
  if (pathname?.startsWith("/admin")) return null;

  if (authenticated && previewMode) {
    return (
      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={() => {
            setPreviewCookie(false);
            router.refresh();
          }}
          aria-label="プレビューを終了して管理者モードに戻る / 미리보기를 끝내고 관리자 모드로 돌아가기"
          className="inline-flex items-center justify-center rounded-full bg-zinc-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-zinc-800"
        >
          <BilingualInline jp="プレビュー中・管理者に戻る" kr="미리보기 중 · 관리자로 돌아가기" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      {authenticated && (
        <button
          type="button"
          onClick={() => {
            setPreviewCookie(true);
            router.refresh();
          }}
          aria-label="訪問者の画面をプレビュー / 방문자 화면 미리보기"
          className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-700 shadow-md transition-colors hover:bg-amber-50 dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
        >
          <BilingualInline jp="プレビュー" kr="미리보기" />
        </button>
      )}
      {authenticated ? (
        <a
          href="/admin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="管理者ページを新しいタブで開く / 관리자 페이지를 새 탭으로 열기"
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-amber-700"
        >
          <BilingualInline jp="管理者ページ" kr="관리자 페이지" />
        </a>
      ) : (
        <a
          href="/admin/login"
          aria-label="管理者ログイン / 관리자 로그인"
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-amber-700"
        >
          <BilingualInline jp="管理者ログイン" kr="관리자 로그인" />
        </a>
      )}
    </div>
  );
}
