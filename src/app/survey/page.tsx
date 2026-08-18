// 공개 설문 참여 폼 — 실제 운영자가 쓰던 구글폼(한국어 연습회 신청서) 문항을 그대로 옮겼다.
// 제출 성공 시 같은 화면에서 감사 메시지로 전환.
"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { DecorativeBackground } from "@/components/decorative-background";

const AGE_OPTIONS = [
  { jp: "10代 ※申込は18歳以上〜", kr: "10대 (※신청은 18세 이상부터)" },
  { jp: "20代", kr: "20대" },
  { jp: "30代", kr: "30대" },
  { jp: "40代", kr: "40대" },
  { jp: "50代以上", kr: "50대 이상" },
];

const KOREAN_LEVEL_OPTIONS = [
  { jp: "ハングルを勉強したて", kr: "한글을 막 배우기 시작함" },
  {
    jp: "ハングルが読める/知っている単語やフレーズが少しある程度",
    kr: "한글을 읽을 수 있음 / 아는 단어·표현이 조금 있는 정도",
  },
  {
    jp: "ハングルがスラスラ書ける/初級文法を勉強している途中",
    kr: "한글을 술술 쓸 수 있음 / 초급 문법을 공부하는 중",
  },
  { jp: "初級文法を使って話すことができる", kr: "초급 문법으로 말할 수 있음" },
  {
    jp: "初級文法は一通り全部習ったが、もっと使いこなせるようになりたい",
    kr: "초급 문법을 한 바퀴 다 배웠지만 더 잘 쓰고 싶음",
  },
  { jp: "初級文法はもう使いこなせる/中級初盤", kr: "초급 문법은 이미 잘 다룸 / 중급 초반" },
  {
    jp: "中級文法をかなり習ったが、もっとレベルアップしたい",
    kr: "중급 문법을 꽤 배웠지만 더 레벨업하고 싶음",
  },
];

const AGREEMENT_ITEMS = [
  {
    jp: "キャンセルや遅刻する場合は、できるだけ早く主催者へ連絡します。",
    kr: "취소나 지각 시 최대한 빨리 주최자에게 연락합니다.",
  },
  {
    jp: "この会ではあらゆる勧誘を禁止します。",
    kr: "이 모임에서는 모든 권유(영업·포교 등) 행위를 금지합니다.",
  },
  {
    jp: "勧誘を行ったことが分かった場合は、2度とこの会に参加できなくなることを理解しました。",
    kr: "권유 행위가 확인될 경우 다시는 이 모임에 참가할 수 없다는 것을 이해했습니다.",
  },
];

export default function SurveyPage() {
  return (
    <Suspense fallback={null}>
      <SurveyFormInner />
    </Suspense>
  );
}

// QR로 넘어올 때 ?eventId=가 붙을 수 있어 useSearchParams가 필요 — 부모에서 Suspense로 감싼다.
function SurveyFormInner() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [participantName, setParticipantName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [koreanLevels, setKoreanLevels] = useState<string[]>([]);
  const [practiceContent, setPracticeContent] = useState("");
  const [otherMessage, setOtherMessage] = useState("");
  const [agreements, setAgreements] = useState([false, false, false]);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const allAgreed = agreements.every(Boolean);

  function toggleKoreanLevel(kr: string) {
    setKoreanLevels((prev) => (prev.includes(kr) ? prev.filter((v) => v !== kr) : [...prev, kr]));
  }

  function toggleAgreement(index: number) {
    setAgreements((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!allAgreed) return;
    setStatus("submitting");
    setErrorMessage("");

    const answers: Record<string, string> = {};
    if (age) answers["나이"] = age;
    if (phone.trim()) answers["전화번호"] = phone.trim();
    if (koreanLevels.length > 0) answers["한국어_수준"] = koreanLevels.join(" / ");
    if (practiceContent.trim()) answers["연습하고_싶은_내용"] = practiceContent.trim();
    if (otherMessage.trim()) answers["기타_전달사항"] = otherMessage.trim();
    answers["참가_규칙_동의"] = "동의함 (3개 항목 모두 확인)";

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: participantName.trim(),
          contact: email.trim() || undefined,
          answers,
          eventId: eventId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "送信中にエラーが発生しました。");
      }

      setStatus("done");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "送信中にエラーが発生しました。");
    }
  }

  if (status === "done") {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-amber-50 px-6 py-16 text-center dark:bg-zinc-950">
        <DecorativeBackground />
        <div className="relative z-10 flex flex-col items-center">
          <Bilingual
            as="h1"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
            krClassName="mt-1 text-sm font-normal text-zinc-500 dark:text-zinc-400"
            jp="送信しました。ありがとうございます。"
            kr="설문이 제출되었습니다. 감사합니다!"
          />
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            貴重なご回答ありがとうございます。次回の交流会でお会いしましょう。
            <br />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              소중한 답변 감사드립니다. 다음 모임에서 만나요.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-amber-50 px-6 py-16 dark:bg-zinc-950">
      <DecorativeBackground />
      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <Bilingual
            as="h1"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
            krClassName="mt-1 text-sm font-normal text-zinc-500 dark:text-zinc-400"
            jp="アンケート参加"
            kr="설문 참여"
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            日韓交流会の参加者アンケートです。気軽にお答えください。
            <br />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              일한교류회 참가자 설문입니다. 편하게 답변해주세요.
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="participantName" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">
                お名前またはニックネーム <span className="text-red-500">*</span>
              </span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                이름 또는 닉네임
              </span>
            </label>
            <input
              id="participantName"
              name="participantName"
              type="text"
              required
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="山田太郎"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">年齢（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">나이 (선택)</span>
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="年齢選択 / 나이 선택">
              {AGE_OPTIONS.map((option) => (
                <button
                  key={option.kr}
                  type="button"
                  aria-pressed={age === option.kr}
                  onClick={() => setAge(age === option.kr ? "" : option.kr)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    age === option.kr
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  <BilingualInline jp={option.jp} kr={option.kr} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">メールアドレス（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                메일 주소 (선택)
              </span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="example@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">電話番号（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                전화번호 (선택)
              </span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="090-1234-5678"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">韓国語レベル（複数選択可・任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                한국어 수준 (중복 선택 가능, 선택)
              </span>
            </span>
            <div className="flex flex-col gap-2" role="group" aria-label="韓国語レベル選択 / 한국어 수준 선택">
              {KOREAN_LEVEL_OPTIONS.map((option) => (
                <label
                  key={option.kr}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm transition-colors hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    checked={koreanLevels.includes(option.kr)}
                    onChange={() => toggleKoreanLevel(option.kr)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
                  />
                  <span className="flex flex-col">
                    <span className="text-zinc-800 dark:text-zinc-100">{option.jp}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{option.kr}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="practiceContent" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">練習したい内容（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                연습하고 싶은 내용 (선택)
              </span>
            </label>
            <textarea
              id="practiceContent"
              name="practiceContent"
              rows={3}
              value={practiceContent}
              onChange={(e) => setPracticeContent(e.target.value)}
              className="resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="自由にご記入ください"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="otherMessage" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">その他伝達事項（任意）</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                기타 전달사항 (선택)
              </span>
            </label>
            <textarea
              id="otherMessage"
              name="otherMessage"
              rows={3}
              value={otherMessage}
              onChange={(e) => setOtherMessage(e.target.value)}
              className="resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="自由にご記入ください"
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/20">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">
                確認事項 <span className="text-red-500">*</span>
              </span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                확인사항 (전부 동의해야 제출 가능)
              </span>
            </span>
            {AGREEMENT_ITEMS.map((item, index) => (
              <label key={item.kr} className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  required
                  checked={agreements[index]}
                  onChange={() => toggleAgreement(index)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
                />
                <span className="flex flex-col">
                  <span className="text-zinc-800 dark:text-zinc-100">{item.jp}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.kr}</span>
                </span>
              </label>
            ))}
          </div>

          {status === "error" && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              <span className="block">{errorMessage}</span>
              <span className="block text-xs opacity-80">제출 중 오류가 발생했습니다.</span>
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting" || !allAgreed}
            aria-label="アンケートを送信する / 설문 제출하기"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? (
              <BilingualInline jp="送信中..." kr="제출 중..." />
            ) : (
              <BilingualInline jp="送信する" kr="제출하기" />
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
