// /admin 전체 레이아웃. 로그인 페이지는 사이드바 없이 폼만 렌더링한다.
// 모바일(<sm)에서는 사이드바가 고정 224px를 그대로 차지해 본문이 못 쓸 정도로
// 좁아지던 문제가 있었다(실측 사고) — 모바일은 슬라이드인 드로어로, sm 이상은
// 기존 고정 사이드바 그대로 유지.
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BilingualInline } from "@/components/bilingual";

const NAV_ITEMS = [
  { href: "/admin", jp: "ダッシュボード", kr: "대시보드" },
  { href: "/admin/participants", jp: "参加者一覧", kr: "참가자 목록" },
  { href: "/admin/applications", jp: "申し込み一覧", kr: "신청 내역" },
  { href: "/admin/events", jp: "イベント管理", kr: "이벤트 관리" },
  { href: "/admin/apply-form", jp: "申し込みフォーム管理", kr: "신청 폼 관리" },
  { href: "/admin/photos", jp: "写真管理", kr: "사진 관리" },
  { href: "/admin/surveys", jp: "アンケート一覧", kr: "설문 목록" },
  { href: "/admin/settings", jp: "設定", kr: "설정" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // 페이지 이동하면 모바일 드로어는 자동으로 닫는다.
  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      console.error("로그아웃 요청 실패");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const navContent = (
    <>
      <div className="px-4 py-5 text-sm font-semibold text-gray-900 dark:text-neutral-100">
        <BilingualInline jp="日韓交流会 管理者" kr="일한교류회 관리자" />
      </div>
      <nav aria-label="管理者メニュー / 관리자 메뉴" className="flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-gray-700 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              <BilingualInline jp={item.jp} kr={item.kr} />
            </Link>
          );
        })}
      </nav>
      <div className="px-2 pb-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="ログアウト / 로그아웃"
          className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {isLoggingOut ? (
            <BilingualInline jp="ログアウト中..." kr="로그아웃 중..." />
          ) : (
            <BilingualInline jp="ログアウト" kr="로그아웃" />
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      {/* 모바일 전용 상단바 — 햄버거 버튼으로 드로어를 연다. sm 이상에서는 숨김. */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 sm:hidden">
        <span className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
          <BilingualInline jp="日韓交流会 管理者" kr="일한교류회 관리자" />
        </span>
        <button
          type="button"
          onClick={() => setIsNavOpen(true)}
          aria-label="メニューを開く / 메뉴 열기"
          className="rounded-md border border-gray-300 p-2 text-gray-700 dark:border-neutral-700 dark:text-neutral-300"
        >
          ☰
        </button>
      </div>

      {/* 모바일 드로어 배경(열렸을 때만, 클릭하면 닫힘) */}
      {isNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setIsNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col border-r border-gray-200 bg-gray-50 transition-transform duration-200 ease-in-out dark:border-neutral-800 dark:bg-neutral-900 sm:static sm:z-auto sm:w-56 sm:shrink-0 sm:translate-x-0 ${
          isNavOpen ? "translate-x-0" : ""
        }`}
      >
        {navContent}
      </aside>

      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
