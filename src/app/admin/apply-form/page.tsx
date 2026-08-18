// 관리자 참가 신청 폼 문항 관리 화면 — 문항 목록 조회 + 새 문항 추가
import { repository } from "@/lib/repository";
import type { ApplyFormField } from "@/lib/types";
import FieldForm from "./field-form";
import FieldList from "./field-list";
import { Bilingual } from "@/components/bilingual";

// 관리자가 추가/수정한 문항이 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
export const dynamic = "force-dynamic";

async function loadFields(): Promise<{ ok: true; items: ApplyFormField[] } | { ok: false }> {
  try {
    const items = await repository.listApplyFormFields();
    return { ok: true, items };
  } catch (error) {
    console.error("신청 폼 항목 목록 로드 실패", error);
    return { ok: false };
  }
}

export default async function AdminApplyFormPage() {
  const data = await loadFields();

  return (
    <div className="flex flex-col gap-8">
      <Bilingual
        as="h1"
        className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
        jp="申し込みフォーム管理"
        kr="신청 폼 관리"
      />

      <FieldForm />

      <section aria-labelledby="apply-form-field-list-heading" className="flex flex-col gap-3">
        <Bilingual
          as="h2"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          jp={<span id="apply-form-field-list-heading">登録済みの項目</span>}
          kr="등록된 항목"
        />

        {!data.ok && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            項目の読み込み中に問題が発生しました。
            <span className="block text-xs opacity-80">항목을 불러오는 중 문제가 발생했습니다.</span>
          </p>
        )}

        {data.ok && data.items.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            まだ項目がありません。
            <span className="block text-xs opacity-80">아직 등록된 항목이 없습니다.</span>
          </p>
        )}

        {data.ok && data.items.length > 0 && <FieldList fields={data.items} />}
      </section>
    </div>
  );
}
