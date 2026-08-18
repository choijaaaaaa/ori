"use client";

// 참가 신청 폼 — 신청 접수 후 QR 코드를 보여주고, QR을 스캔하면 설문 페이지로 이동한다.
// 이벤트 선택/이름은 고정 항목이고, 그 외 문항은 관리자가 등록한 ApplyFormField[]를 동적으로 렌더링한다.
import { useState, type FormEvent } from "react";
import QRCode from "react-qr-code";
import { Bilingual, BilingualInline } from "@/components/bilingual";
import { DecorativeBackground } from "@/components/decorative-background";
import type { ApplyFormField, EventPost } from "@/lib/types";

// checkbox_group 응답을 이 구분자로 join한다 — /api/applications의 requireAll 개수 검증(split(" / "))과
// 반드시 일치해야 하므로 임의로 바꾸면 안 된다.
const CHECKBOX_GROUP_SEPARATOR = " / ";

function isFieldSatisfied(field: ApplyFormField, values: Record<string, string>): boolean {
  if (field.type === "image") return true; // 안내용 블록, 응답 없음
  const isRequired = field.required || (field.type === "checkbox_group" && field.requireAll);
  if (!isRequired) return true;
  const value = values[field.fieldKey]?.trim() ?? "";
  if (!value) return false;
  if (field.type === "checkbox_group" && field.requireAll) {
    const selectedCount = value.split(CHECKBOX_GROUP_SEPARATOR).filter((v) => v.trim()).length;
    return selectedCount >= field.options.length;
  }
  return true;
}

function FieldLabelContent({ field }: { field: ApplyFormField }) {
  const showAsterisk = field.required || (field.type === "checkbox_group" && field.requireAll);
  return (
    <>
      <span className="block">
        {field.labelJp}
        {showAsterisk && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">{field.labelKr}</span>
    </>
  );
}

function FieldHelp({ field }: { field: ApplyFormField }) {
  if (!field.helpJp && !field.helpKr) return null;
  return (
    <p className="whitespace-pre-wrap text-xs text-zinc-500 dark:text-zinc-400">
      {field.helpJp}
      {field.helpJp && field.helpKr && <br />}
      {field.helpKr}
    </p>
  );
}

export default function ApplyForm({
  events,
  activeCountByEventId,
  initialEventId,
  introJp,
  introKr,
  fields,
}: {
  events: EventPost[];
  activeCountByEventId: Record<string, number>;
  initialEventId?: string;
  introJp: string;
  introKr: string;
  fields: ApplyFormField[];
}) {
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState(
    initialEventId && events.some((e) => e.id === initialEventId) ? initialEventId : ""
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const sortedFields = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
  const allFieldsSatisfied = sortedFields.every((field) => isFieldSatisfied(field, values));

  function setTextValue(fieldKey: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldKey]: value }));
  }

  function toggleRadioOption(fieldKey: string, optionKr: string) {
    setValues((prev) => {
      const updated = { ...prev };
      if (updated[fieldKey] === optionKr) delete updated[fieldKey];
      else updated[fieldKey] = optionKr;
      return updated;
    });
  }

  function toggleCheckboxGroupOption(fieldKey: string, optionKr: string) {
    setValues((prev) => {
      const current = prev[fieldKey] ? prev[fieldKey].split(CHECKBOX_GROUP_SEPARATOR) : [];
      const next = current.includes(optionKr)
        ? current.filter((v) => v !== optionKr)
        : [...current, optionKr];
      const updated = { ...prev };
      if (next.length > 0) updated[fieldKey] = next.join(CHECKBOX_GROUP_SEPARATOR);
      else delete updated[fieldKey];
      return updated;
    });
  }

  function toggleSingleCheckbox(fieldKey: string) {
    setValues((prev) => {
      const updated = { ...prev };
      if (updated[fieldKey]) delete updated[fieldKey];
      else updated[fieldKey] = "체크됨";
      return updated;
    });
  }

  function renderField(field: ApplyFormField) {
    switch (field.type) {
      case "text": {
        const inputType = field.fieldKey === "email" ? "email" : field.fieldKey === "phone" ? "tel" : "text";
        return (
          <div className="flex flex-col gap-1.5" key={field.id}>
            <label htmlFor={field.fieldKey} className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <FieldLabelContent field={field} />
            </label>
            <FieldHelp field={field} />
            <input
              id={field.fieldKey}
              name={field.fieldKey}
              type={inputType}
              required={field.required}
              value={values[field.fieldKey] ?? ""}
              onChange={(e) => setTextValue(field.fieldKey, e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        );
      }
      case "textarea":
        return (
          <div className="flex flex-col gap-1.5" key={field.id}>
            <label htmlFor={field.fieldKey} className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <FieldLabelContent field={field} />
            </label>
            <FieldHelp field={field} />
            <textarea
              id={field.fieldKey}
              name={field.fieldKey}
              rows={3}
              required={field.required}
              value={values[field.fieldKey] ?? ""}
              onChange={(e) => setTextValue(field.fieldKey, e.target.value)}
              className="resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="自由にご記入ください"
            />
          </div>
        );
      case "radio_group":
        return (
          <div className="flex flex-col gap-1.5" key={field.id}>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <FieldLabelContent field={field} />
            </span>
            <FieldHelp field={field} />
            <div className="flex flex-wrap gap-2" role="group" aria-label={`${field.labelJp} / ${field.labelKr}`}>
              {field.options.map((option) => {
                const selected = values[field.fieldKey] === option.kr;
                return (
                  <button
                    key={option.kr}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleRadioOption(field.fieldKey, option.kr)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      selected
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    }`}
                  >
                    <BilingualInline jp={option.jp} kr={option.kr} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      case "checkbox_group": {
        const selectedLabels = values[field.fieldKey]
          ? values[field.fieldKey].split(CHECKBOX_GROUP_SEPARATOR)
          : [];
        // requireAll(동의 체크리스트)인 경우 survey/page.tsx의 AGREEMENT_ITEMS와 동일하게
        // 강조 박스로 묶어서 "전부 체크해야 한다"는 의미를 시각적으로 드러낸다.
        if (field.requireAll) {
          return (
            <div
              className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/20"
              key={field.id}
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                <FieldLabelContent field={field} />
              </span>
              <FieldHelp field={field} />
              {field.options.map((option) => (
                <label key={option.kr} className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedLabels.includes(option.kr)}
                    onChange={() => toggleCheckboxGroupOption(field.fieldKey, option.kr)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
                  />
                  <span className="flex flex-col">
                    <span className="text-zinc-800 dark:text-zinc-100">{option.jp}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{option.kr}</span>
                  </span>
                </label>
              ))}
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-1.5" key={field.id}>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <FieldLabelContent field={field} />
            </span>
            <FieldHelp field={field} />
            <div
              className="flex flex-col gap-2"
              role="group"
              aria-label={`${field.labelJp} / ${field.labelKr}`}
            >
              {field.options.map((option) => (
                <label
                  key={option.kr}
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm transition-colors hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedLabels.includes(option.kr)}
                    onChange={() => toggleCheckboxGroupOption(field.fieldKey, option.kr)}
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
        );
      }
      case "checkbox":
        return (
          <div className="flex flex-col gap-1.5" key={field.id}>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                required={field.required}
                checked={Boolean(values[field.fieldKey])}
                onChange={() => toggleSingleCheckbox(field.fieldKey)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
              />
              <span className="flex flex-col">
                <span className="text-zinc-800 dark:text-zinc-100">
                  {field.labelJp}
                  {field.required && <span className="ml-0.5 text-red-500">*</span>}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{field.labelKr}</span>
              </span>
            </label>
            <FieldHelp field={field} />
          </div>
        );
      case "image":
        return (
          <div className="flex flex-col gap-2" key={field.id}>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">{field.labelJp}</span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                {field.labelKr}
              </span>
            </span>
            <FieldHelp field={field} />
            {field.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- 관리자가 올린 임의 URL(Supabase Storage 외 포함) 대응, 기존 코드베이스 관례
              <img
                src={field.imageUrl}
                alt={`${field.labelJp} / ${field.labelKr}`}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
              />
            )}
          </div>
        );
      default:
        return null;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!allFieldsSatisfied) return;
    setStatus("submitting");
    setErrorMessage("");

    const answers: Record<string, string> = {};
    for (const field of sortedFields) {
      const value = values[field.fieldKey];
      if (value && value.trim()) answers[field.fieldKey] = value.trim();
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          eventId: eventId || undefined,
          answers,
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
    // 선택한 회차가 있으면 설문도 그 회차 소속으로 이어지도록 eventId를 실어 보낸다.
    const surveyPath = eventId ? `/survey?eventId=${eventId}` : "/survey";
    const surveyUrl =
      typeof window !== "undefined" ? `${window.location.origin}${surveyPath}` : surveyPath;

    return (
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-amber-50 px-6 py-16 text-center dark:bg-zinc-950">
        <DecorativeBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Bilingual
            as="h1"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-50"
            krClassName="mt-1 text-sm font-normal text-zinc-500 dark:text-zinc-400"
            jp="お申し込みを受け付けました。"
            kr="신청이 접수되었습니다."
          />
          <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-300">
            下のQRコードをカメラで読み取ると、アンケートページに移動します。
            <br />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              아래 QR 코드를 카메라로 스캔하면 설문 페이지로 이동합니다.
            </span>
          </p>
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <QRCode value={surveyUrl} size={180} />
          </div>
          <p className="text-xs text-zinc-400">
            <BilingualInline jp="読み取れない場合はこちらをタップ" kr="스캔이 안 되면 여기를 눌러주세요" />
            {" — "}
            <a href={surveyPath} className="underline hover:text-amber-600">
              {surveyUrl}
            </a>
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
            jp="参加申し込み"
            kr="참가 신청"
          />
          <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
            {introJp}
            <br />
            <span className="whitespace-pre-wrap text-xs text-zinc-500 dark:text-zinc-400">
              {introKr}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {events.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="eventId" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                <span className="block">参加希望の回（任意）</span>
                <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  참가 희망 회차 (선택)
                </span>
              </label>
              <select
                id="eventId"
                name="eventId"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">未定・特に希望なし / 미정 · 특별히 없음</option>
                {events.map((event) => {
                  const activeCount = activeCountByEventId[event.id] ?? 0;
                  const isFull =
                    event.closed || (typeof event.capacity === "number" && activeCount >= event.capacity);
                  return (
                    <option key={event.id} value={event.id} disabled={isFull}>
                      {event.eventDate ? `${event.eventDate} — ` : ""}
                      {event.title}
                      {isFull ? " (満席 / 마감)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              <span className="block">
                お名前またはニックネーム <span className="text-red-500">*</span>
              </span>
              <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                이름 또는 닉네임
              </span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="山田太郎"
            />
          </div>

          {sortedFields.map((field) => renderField(field))}

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
            disabled={status === "submitting" || !allFieldsSatisfied}
            aria-label="申し込みを送信する / 신청 제출하기"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? (
              <BilingualInline jp="送信中..." kr="제출 중..." />
            ) : (
              <BilingualInline jp="申し込む" kr="신청하기" />
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
