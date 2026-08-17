// 관리자 설정 — 비밀번호 변경 + 사이트 문구 편집.
import { repository } from "@/lib/repository";
import { APPLY_INTRO_KEY, APPLY_INTRO_DEFAULT } from "@/lib/site-text-defaults";
import { Bilingual } from "@/components/bilingual";
import PasswordForm from "./password-form";
import SiteTextForm from "./site-text-form";

// 문구가 바뀌면 즉시 반영돼야 하므로 정적 프리렌더링을 막는다(빌드 시점 데이터로 캐시되면 안 됨).
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const applyIntro = await repository.getSiteText(APPLY_INTRO_KEY).catch(() => null);

  return (
    <div className="flex flex-col gap-10">
      <Bilingual
        as="h1"
        className="text-xl font-semibold text-gray-900 dark:text-neutral-100"
        jp="設定"
        kr="설정"
      />

      <section className="flex flex-col gap-3">
        <Bilingual
          as="h2"
          className="text-base font-semibold text-gray-900 dark:text-neutral-100"
          jp="パスワード変更"
          kr="비밀번호 변경"
        />
        <PasswordForm />
      </section>

      <section className="flex flex-col gap-3">
        <Bilingual
          as="h2"
          className="text-base font-semibold text-gray-900 dark:text-neutral-100"
          jp="サイト文言"
          kr="사이트 문구"
        />
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          日本語を入力すると、その下に表示される韓国語も一緒に入力してください（自動翻訳はまだありません）。
          <br />
          일본어를 입력하고, 그 아래 표시될 한국어도 함께 입력해주세요 (자동 번역은 아직 없습니다).
        </p>
        <SiteTextForm
          siteTextKey={APPLY_INTRO_KEY}
          labelJp="申し込みページの案内文"
          labelKr="신청 페이지 안내문구"
          initialJp={applyIntro?.valueJp || APPLY_INTRO_DEFAULT.jp}
          initialKr={applyIntro?.valueKr || APPLY_INTRO_DEFAULT.kr}
        />
      </section>
    </div>
  );
}
