// 완전 무료 공개 번역 API(MyMemory)로 일본어→한국어 자동 번역. API 키/가입 불필요.
// 품질은 DeepL/Google보다 다소 거칠 수 있어 결과를 그대로 저장하지 않고 관리자가
// 검토·수정할 수 있는 자리(편집 가능한 한국어 필드)에 채워 넣는 용도로만 쓴다.
const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";
const MAX_CHUNK_LENGTH = 450; // MyMemory 1회 요청 길이 제한(500자)에 여유를 둔다.

async function translateChunk(text: string): Promise<string> {
  const url = new URL(MYMEMORY_ENDPOINT);
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", "ja|ko");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("번역 요청이 실패했습니다.");
  const data: { responseData?: { translatedText?: string } } = await res.json();
  if (!data.responseData?.translatedText) throw new Error("번역 결과를 받지 못했습니다.");
  return data.responseData.translatedText;
}

// 일본어 문장부호(。) 기준으로 나눠 각각 번역 후 이어붙인다(1회 요청 길이 제한 대응).
function splitIntoChunks(text: string): string[] {
  const sentences = text.split(/(?<=。)/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && (current + sentence).length > MAX_CHUNK_LENGTH) {
      chunks.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function translateJapaneseToKorean(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const chunks = splitIntoChunks(trimmed);
  const translated = await Promise.all(chunks.map(translateChunk));
  return translated.join(" ");
}
