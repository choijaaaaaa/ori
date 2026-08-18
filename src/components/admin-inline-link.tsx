// 공개 페이지의 특정 섹션 옆에 붙는 관리자 전용 바로가기 버튼(로그인 상태에서만 렌더링).
// 항목 편집/추가처럼 자주 쓰는 관리 화면으로 그 자리에서 바로 이동할 수 있게 한다.
import { BilingualInline } from "./bilingual";

export function AdminInlineLink({ href, jp, kr }: { href: string; jp: string; kr: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
    >
      <BilingualInline jp={jp} kr={kr} />
    </a>
  );
}
