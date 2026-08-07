// 관리자 비밀번호 변경 화면.
"use client";

import { useState, type FormEvent } from "react";
import { Bilingual, BilingualInline } from "@/components/bilingual";

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("新しいパスワードが一致しません。 (새 비밀번호가 일치하지 않습니다.)");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error?.message ?? "パスワードの変更に失敗しました。 (비밀번호 변경에 실패했습니다.)");
        return;
      }

      setSuccessMessage("パスワードが変更されました (비밀번호가 변경되었습니다)");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("ネットワークエラーが発生しました。もう一度お試しください。 (네트워크 오류가 발생했습니다. 다시 시도해주세요.)");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Bilingual
        as="h1"
        className="text-xl font-semibold text-gray-900 dark:text-neutral-100"
        jp="設定"
        kr="설정"
      />

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex max-w-sm flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="current-password"
            className="text-sm font-medium text-gray-700 dark:text-neutral-300"
          >
            <BilingualInline jp="現在のパスワード" kr="현재 비밀번호" />
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="new-password"
            className="text-sm font-medium text-gray-700 dark:text-neutral-300"
          >
            <BilingualInline jp="新しいパスワード" kr="새 비밀번호" />
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-gray-700 dark:text-neutral-300"
          >
            <BilingualInline jp="新しいパスワード（確認）" kr="새 비밀번호 확인" />
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p role="status" className="text-sm text-green-600 dark:text-green-400">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {isSubmitting ? (
            <BilingualInline jp="変更中..." kr="변경 중..." />
          ) : (
            <BilingualInline jp="変更する" kr="비밀번호 변경" />
          )}
        </button>
      </form>
    </div>
  );
}
