// /admin 전체 레이아웃. 로그인 페이지는 사이드바 없이 폼만 렌더링한다.
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { BilingualInline } from "@/components/bilingual";

const NAV_ITEMS = [
  { href: "/admin", jp: "ダッシュボード", kr: "대시보드" },
  { href: "/admin/applications", jp: "申し込み一覧", kr: "신청 내역" },
  { href: "/admin/events", jp: "イベント管理", kr: "이벤트 관리" },
  { href: "/admin/photos", jp: "写真管理", kr: "사진 관리" },
  { href: "/admin/surveys", jp: "アンケート一覧", kr: "설문 목록" },
  { href: "/admin/settings", jp: "設定", kr: "설정" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900">
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
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
