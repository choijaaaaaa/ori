// 공개 페이지용 장식 배경 — 오리와 음식 모티프를 격자로 반복시켜 패턴처럼 보이게 한다.
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

const MOTIFS = ["duck", "🍙", "🍜", "🍡", "🍱", "duck", "🍘", "🥟"] as const;
const COLS = 5;
const ROWS = 10;

const PATTERN_ITEMS = Array.from({ length: COLS * ROWS }, (_, idx) => {
  const col = idx % COLS;
  const row = Math.floor(idx / COLS);
  const jitterX = ((idx * 13) % 9) - 4; // -4 ~ 4
  const jitterY = ((idx * 7) % 9) - 4;
  const left = (col / COLS) * 100 + 100 / COLS / 2 + jitterX;
  const top = (row / ROWS) * 100 + 100 / ROWS / 2 + jitterY;
  const rotate = ((idx * 37) % 50) - 25;
  const scale = 0.75 + ((idx * 11) % 5) * 0.1; // 0.75 ~ 1.15
  const motif = MOTIFS[idx % MOTIFS.length];
  return { idx, left, top, rotate, scale, motif };
});

export function DecorativeBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PATTERN_ITEMS.map((item) => (
        <div
          key={item.idx}
          className="absolute opacity-[0.4] dark:opacity-[0.22]"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            transform: `translate(-50%, -50%) rotate(${item.rotate}deg) scale(${item.scale})`,
          }}
        >
          {item.motif === "duck" ? (
            <Duck className="h-14 w-14" />
          ) : (
            <span className="text-4xl leading-none">{item.motif}</span>
          )}
        </div>
      ))}
    </div>
  );
}
