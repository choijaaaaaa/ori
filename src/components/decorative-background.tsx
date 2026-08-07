// 공개 페이지용 장식 배경 — 오리와 음식 모티프로 허전한 배경에 귀여운 느낌을 더한다.
function Duck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <ellipse cx="34" cy="42" rx="22" ry="15" fill="#FBBF24" />
      <circle cx="20" cy="23" r="12" fill="#FBBF24" />
      <path d="M6 23c-3.5 0-5.5 1.7-5.5 3.4S3 29 7 28z" fill="#F59E0B" />
      <circle cx="16" cy="20" r="2" fill="#3F2A14" />
      <path
        d="M30 44c6 2.5 15 1 19-4.5"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function DecorativeBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Duck className="absolute -left-6 top-8 h-16 w-16 -rotate-12 opacity-[0.15] dark:opacity-[0.08]" />
      <Duck className="absolute right-2 top-36 h-11 w-11 rotate-6 opacity-[0.12] dark:opacity-[0.06]" />
      <Duck className="absolute left-[8%] bottom-28 h-20 w-20 rotate-3 opacity-[0.1] dark:opacity-[0.05]" />
      <Duck className="absolute right-[12%] bottom-10 h-14 w-14 -rotate-6 opacity-[0.12] dark:opacity-[0.06]" />
      <span className="absolute right-[8%] top-24 rotate-6 text-4xl opacity-[0.18] dark:opacity-[0.1]">
        🍙
      </span>
      <span className="absolute left-[6%] bottom-48 -rotate-6 text-5xl opacity-[0.15] dark:opacity-[0.08]">
        🍜
      </span>
      <span className="absolute right-[22%] bottom-4 text-3xl opacity-[0.18] dark:opacity-[0.1]">
        🍡
      </span>
      <span className="absolute left-[40%] top-6 text-2xl opacity-[0.15] dark:opacity-[0.08]">
        🍱
      </span>
    </div>
  );
}
