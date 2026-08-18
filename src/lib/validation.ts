// YYYY-MM-DD 형식이면서 실재하는 날짜인지 확인. HTML date input이 보내는 형식과 일치.
export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// 지도 앱(구글맵 등)에서 공유한 위치 링크가 http(s) URL 형식인지 확인.
export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
