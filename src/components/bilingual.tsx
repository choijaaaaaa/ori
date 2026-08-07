import type { ElementType, ReactNode } from "react";

// 일본어를 메인으로, 한국어를 작은 보조 텍스트로 함께 보여주는 공통 UI 패턴.
// 일본인 운영자 기준으로 세션이 진행되므로 일본어가 우선이다.
export function Bilingual({
  jp,
  kr,
  as: Tag = "div",
  className = "",
  krClassName = "text-sm text-gray-500 dark:text-gray-400 font-normal",
}: {
  jp: ReactNode;
  kr: ReactNode;
  as?: ElementType;
  className?: string;
  krClassName?: string;
}) {
  return (
    <Tag className={className}>
      <span className="block">{jp}</span>
      <span className={`block ${krClassName}`}>{kr}</span>
    </Tag>
  );
}

// 버튼/네비게이션/테이블 헤더 등 한 줄짜리 짧은 라벨용 — "日本語(한국어)" 인라인 표기.
export function BilingualInline({ jp, kr }: { jp: ReactNode; kr: ReactNode }) {
  return (
    <>
      {jp}
      <span className="text-xs opacity-70 ml-1">({kr})</span>
    </>
  );
}
