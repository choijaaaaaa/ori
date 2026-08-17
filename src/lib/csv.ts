// 브라우저 전용 CSV 생성/다운로드 유틸. "use client" 컴포넌트 안에서만 호출된다.
function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCsv(filename: string, rows: string[][]): void {
  if (typeof window === "undefined") return;

  const csvBody = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  // BOM을 붙여야 엑셀에서 한글/일본어가 깨지지 않는다.
  const csvContent = `﻿${csvBody}`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
