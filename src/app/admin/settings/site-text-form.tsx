"use client";

// 코드 수정 없이 관리자가 직접 고치는 사이트 문구 편집 폼 — 일본어를 입력하면
// 그 아래에 한국어 번역이 같이 노출되므로, 두 언어 다 여기서 입력해야 한다
// (자동 번역은 별도 API 키가 필요해 아직 붙이지 않았다).
import { useState, type FormEvent } from "react";
import { BilingualInline } from "@/components/bilingual";

export default function SiteTextForm({
  siteTextKey,
  labelJp,
  labelKr,
  initialJp,
  initialKr,
}: {
  siteTextKey: string;
  labelJp: string;
  labelKr: string;
  initialJp: string;
  initialKr: string;
}) {
  const [valueJp, setValueJp] = useState(initialJp);
  const [valueKr, setValueKr] = useState(initialKr);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/site-text/${siteTextKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valueJp, valueKr }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.error?.message ?? "保存に失敗しました。 (저장에 실패했습니다.)");
        return;
      }

      setSuccessMessage("保存しました (저장했습니다)");
    } catch {
      setErrorMessage("ネットワークエラーが発生しました。もう一度お試しください。 (네트워크 오류가 발생했습니다. 다시 시도해주세요.)");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${siteTextKey}-jp`}
          className="text-sm font-medium text-gray-700 dark:text-neutral-300"
        >
          <BilingualInline jp={`${labelJp}（日本語）`} kr={`${labelKr} (일본어)`} />
        </label>
        <textarea
          id={`${siteTextKey}-jp`}
          value={valueJp}
          onChange={(event) => setValueJp(event.target.value)}
          rows={3}
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${siteTextKey}-kr`}
          className="text-sm font-medium text-gray-700 dark:text-neutral-300"
        >
          <BilingualInline jp={`${labelJp}（韓国語・下に表示）`} kr={`${labelKr} (한국어, 아래 보조로 표시)`} />
        </label>
        <textarea
          id={`${siteTextKey}-kr`}
          value={valueKr}
          onChange={(event) => setValueKr(event.target.value)}
          rows={3}
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
        className="mt-2 w-fit rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        {isSubmitting ? (
          <BilingualInline jp="保存中..." kr="저장 중..." />
        ) : (
          <BilingualInline jp="保存する" kr="저장하기" />
        )}
      </button>
    </form>
  );
}
