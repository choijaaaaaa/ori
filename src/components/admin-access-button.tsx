"use client";

// 공개 페이지 우상단에 떠 있는 관리자 접근 버튼.
// 미로그인 상태: 로그인 페이지로 이동. 로그인 상태: 관리자 페이지를 새 창으로 연다.
// /admin/* 경로에서는 자체 사이드바+로그아웃 UI가 이미 있으므로 숨긴다.
import { usePathname } from "next/navigation";
import { BilingualInline } from "./bilingual";

export function AdminAccessButton({ authenticated }: { authenticated: boolean }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed right-4 top-4 z-50">
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
