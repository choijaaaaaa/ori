"use client";

// 일본어 입력 필드 옆에 붙는 "자동 번역" 버튼들이 공통으로 쓰는 훅.
import { useState } from "react";

export function useAutoTranslate() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function translate(text: string): Promise<string | null> {
    setError(null);
    if (!text.trim()) {
      setError("먼저 일본어를 입력해주세요.");
      return null;
    }
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "번역에 실패했습니다.");
      }
      const data = (await res.json()) as { translated: string };
      return data.translated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류로 번역에 실패했습니다.");
      return null;
    } finally {
      setIsTranslating(false);
    }
  }

  return { translate, isTranslating, error };
}
