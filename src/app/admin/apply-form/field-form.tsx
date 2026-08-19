"use client";

// 참가 신청 폼 항목 작성/수정 폼 — editingField가 있으면 수정 모드(PATCH), 없으면 생성 모드(POST).
// type은 생성 시에만 지정 가능해 API가 PATCH로 못 바꾸므로, 수정 모드에서는 읽기 전용으로만 보여준다.
import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BilingualInline } from "@/components/bilingual";
import { resizeImageFile, uploadImage } from "@/lib/image-utils";
import { useAutoTranslate } from "@/lib/use-auto-translate";
import type { ApplyFormField, ApplyFormFieldOption, ApplyFormFieldType } from "@/lib/types";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const TYPE_OPTIONS: { value: ApplyFormFieldType; jp: string; kr: string }[] = [
  { value: "text", jp: "1行テキスト", kr: "한 줄 텍스트" },
  { value: "textarea", jp: "複数行テキスト", kr: "여러 줄 텍스트" },
  { value: "radio_group", jp: "単一選択（ラジオボタン）", kr: "단일 선택 (라디오)" },
  { value: "checkbox_group", jp: "複数選択（チェックボックス）", kr: "다중 선택 (체크박스)" },
  { value: "checkbox", jp: "単一チェック（同意など）", kr: "단일 체크 (동의 등)" },
  { value: "image", jp: "画像案内ブロック", kr: "이미지 안내 블록" },
];

// 목록 카드의 타입 배지 표시에도 재사용한다.
export function getTypeLabel(type: ApplyFormFieldType) {
  return TYPE_OPTIONS.find((opt) => opt.value === type) ?? TYPE_OPTIONS[0];
}

export default function FieldForm({
  editingField,
  onDone,
}: {
  editingField?: ApplyFormField;
  onDone?: () => void;
}) {
  const router = useRouter();
  const isEditMode = Boolean(editingField);
  // 같은 페이지에 생성 폼과 여러 수정 폼이 동시에 렌더링될 수 있어 인스턴스별로 고유한 필드 id가 필요하다.
  const uid = useId();

  const [type, setType] = useState<ApplyFormFieldType>(editingField?.type ?? "text");
  const [labelJp, setLabelJp] = useState(editingField?.labelJp ?? "");
  const [labelKr, setLabelKr] = useState(editingField?.labelKr ?? "");
  const [helpJp, setHelpJp] = useState(editingField?.helpJp ?? "");
  const [helpKr, setHelpKr] = useState(editingField?.helpKr ?? "");
  const [options, setOptions] = useState<ApplyFormFieldOption[]>(editingField?.options ?? []);
  const [required, setRequired] = useState(editingField?.required ?? true);
  const [requireAll, setRequireAll] = useState(editingField?.requireAll ?? false);
  const [imageUrl, setImageUrl] = useState(editingField?.imageUrl ?? "");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsOptions = type === "radio_group" || type === "checkbox_group";
  const needsImage = type === "image";
  const showRequired = type !== "image"; // 응답 자체가 없는 안내 블록에는 필수 여부가 무의미
  const showRequireAll = type === "checkbox_group";

  function handleTypeChange(nextType: ApplyFormFieldType) {
    setType(nextType);
    if ((nextType === "radio_group" || nextType === "checkbox_group") && options.length === 0) {
      setOptions([{ jp: "", kr: "" }]);
    }
  }

  function updateOption(index: number, field: "jp" | "kr", value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  }

  const { translate, isTranslating, error: translateError } = useAutoTranslate();

  async function handleAutoTranslateLabel() {
    const result = await translate(labelJp);
    if (result !== null) setLabelKr(result);
  }

  // 일본어 입력을 마치고 다른 곳을 클릭하면 자동으로 번역해 채운다. 한국어를 이미
  // 직접 써놓은 경우는 실수로 덮어쓰지 않도록 비어있을 때만 동작한다.
  function handleLabelJpBlur() {
    if (!labelKr.trim() && labelJp.trim()) handleAutoTranslateLabel();
  }

  async function handleAutoTranslateHelp() {
    const result = await translate(helpJp);
    if (result !== null) setHelpKr(result);
  }

  function handleHelpJpBlur() {
    if (!helpKr.trim() && helpJp.trim()) handleAutoTranslateHelp();
  }

  async function handleAutoTranslateOption(index: number) {
    const result = await translate(options[index]?.jp ?? "");
    if (result !== null) updateOption(index, "kr", result);
  }

  function handleOptionJpBlur(index: number) {
    const opt = options[index];
    if (opt && !opt.kr.trim() && opt.jp.trim()) handleAutoTranslateOption(index);
  }

  function addOption() {
    setOptions((prev) => [...prev, { jp: "", kr: "" }]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("파일 용량이 너무 큽니다 (최대 15MB).");
      event.target.value = "";
      return;
    }

    setError(null);
    setIsProcessingImage(true);
    try {
      const { blob, previewUrl } = await resizeImageFile(file);
      setImageUrl("");
      setImageBlob(blob);
      setImagePreviewUrl(previewUrl);
    } catch {
      setError("이미지를 처리하는 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedLabelJp = labelJp.trim();
    if (!trimmedLabelJp) {
      setError("일본어 라벨을 입력해주세요.");
      return;
    }
    const cleanedOptions = options
      .map((opt) => ({ jp: opt.jp.trim(), kr: opt.kr.trim() }))
      .filter((opt) => opt.jp);
    if (needsOptions && cleanedOptions.length === 0) {
      setError("선택지를 1개 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalImageUrl = needsImage ? (imageBlob ? await uploadImage(imageBlob) : imageUrl) : "";

      const res = await fetch(
        isEditMode ? `/api/apply-form-fields/${editingField!.id}` : "/api/apply-form-fields",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditMode
              ? {
                  labelJp: trimmedLabelJp,
                  labelKr: labelKr.trim(),
                  helpJp: helpJp.trim(),
                  helpKr: helpKr.trim(),
                  ...(needsOptions ? { options: cleanedOptions } : {}),
                  ...(showRequired ? { required } : {}),
                  ...(showRequireAll ? { requireAll } : {}),
                  ...(needsImage ? { imageUrl: finalImageUrl || null } : {}),
                }
              : {
                  type,
                  labelJp: trimmedLabelJp,
                  labelKr: labelKr.trim() || undefined,
                  helpJp: helpJp.trim() || undefined,
                  helpKr: helpKr.trim() || undefined,
                  options: needsOptions ? cleanedOptions : undefined,
                  required: showRequired ? required : false,
                  requireAll: showRequireAll ? requireAll : false,
                  imageUrl: needsImage ? finalImageUrl || undefined : undefined,
                }
          ),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.error?.message ?? (isEditMode ? "항목 수정에 실패했습니다." : "항목 추가에 실패했습니다.")
        );
        return;
      }

      if (!isEditMode) {
        setType("text");
        setLabelJp("");
        setLabelKr("");
        setHelpJp("");
        setHelpKr("");
        setOptions([]);
        setRequired(true);
        setRequireAll(false);
        setImageUrl("");
        setImagePreviewUrl("");
        setImageBlob(null);
      }
      router.refresh();
      onDone?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? "네트워크 오류로 항목 수정에 실패했습니다."
            : "네트워크 오류로 항목 추가에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const readonlyTypeLabel = editingField ? getTypeLabel(editingField.type) : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      aria-label={
        isEditMode ? "項目編集フォーム / 항목 수정 폼" : "項目作成フォーム / 새 항목 작성 폼"
      }
    >
      {isEditMode ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="項目タイプ" kr="항목 유형" />
          </span>
          <p className="w-fit rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            <BilingualInline jp={readonlyTypeLabel!.jp} kr={readonlyTypeLabel!.kr} />
          </p>
          <p className="text-xs text-zinc-400">
            <BilingualInline jp="タイプは作成後に変更できません。" kr="유형은 생성 후 변경할 수 없습니다." />
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-type`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="項目タイプ" kr="항목 유형" />
          </label>
          <select
            id={`${uid}-type`}
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as ApplyFormFieldType)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {`${opt.jp} (${opt.kr})`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-labelJp`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="ラベル（日本語）" kr="라벨 (일본어)" />
          </label>
          <input
            id={`${uid}-labelJp`}
            type="text"
            value={labelJp}
            onChange={(e) => setLabelJp(e.target.value)}
            onBlur={handleLabelJpBlur}
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <label htmlFor={`${uid}-labelKr`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <BilingualInline jp="ラベル（韓国語）" kr="라벨 (한국어)" />
            </label>
            <button
              type="button"
              onClick={handleAutoTranslateLabel}
              disabled={isTranslating || !labelJp.trim()}
              className="rounded-full border border-amber-300 px-2 py-0.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              <BilingualInline jp="自動翻訳" kr="자동 번역" />
            </button>
          </div>
          <input
            id={`${uid}-labelKr`}
            type="text"
            value={labelKr}
            onChange={(e) => setLabelKr(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-helpJp`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="補足説明（日本語・任意）" kr="도움말 (일본어, 선택)" />
          </label>
          <textarea
            id={`${uid}-helpJp`}
            value={helpJp}
            onChange={(e) => setHelpJp(e.target.value)}
            onBlur={handleHelpJpBlur}
            rows={2}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <label htmlFor={`${uid}-helpKr`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <BilingualInline jp="補足説明（韓国語・任意）" kr="도움말 (한국어, 선택)" />
            </label>
            <button
              type="button"
              onClick={handleAutoTranslateHelp}
              disabled={isTranslating || !helpJp.trim()}
              className="rounded-full border border-amber-300 px-2 py-0.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              <BilingualInline jp="自動翻訳" kr="자동 번역" />
            </button>
          </div>
          <textarea
            id={`${uid}-helpKr`}
            value={helpKr}
            onChange={(e) => setHelpKr(e.target.value)}
            rows={2}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>
      {translateError && <p className="text-xs text-red-600 dark:text-red-400">{translateError}</p>}

      {needsOptions && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="選択肢" kr="선택지" />
          </span>
          {options.length === 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <BilingualInline jp="選択肢を追加してください。" kr="선택지를 추가해주세요." />
            </p>
          )}
          {options.map((opt, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={opt.jp}
                onChange={(e) => updateOption(index, "jp", e.target.value)}
                onBlur={() => handleOptionJpBlur(index)}
                placeholder="日本語"
                aria-label={`選択肢${index + 1}（日本語） / 선택지 ${index + 1} (일본어)`}
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="text"
                value={opt.kr}
                onChange={(e) => updateOption(index, "kr", e.target.value)}
                placeholder="한국어"
                aria-label={`選択肢${index + 1}（韓国語） / 선택지 ${index + 1} (한국어)`}
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                onClick={() => handleAutoTranslateOption(index)}
                disabled={isTranslating || !opt.jp.trim()}
                aria-label={`選択肢${index + 1}を自動翻訳 / 선택지 ${index + 1} 자동 번역`}
                className="inline-flex items-center justify-center rounded-full border border-amber-300 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
              >
                訳
              </button>
              <button
                type="button"
                onClick={() => removeOption(index)}
                aria-label="選択肢削除 / 선택지 삭제"
                className="inline-flex items-center justify-center rounded-full border border-red-300 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="w-fit rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <BilingualInline jp="選択肢を追加" kr="선택지 추가" />
          </button>
        </div>
      )}

      {needsImage && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="案内画像" kr="안내 이미지" />
          </span>
          <div className="flex items-center gap-3">
            <label htmlFor={`${uid}-image-file`} className="text-xs text-zinc-500 dark:text-zinc-400">
              <BilingualInline jp="画像をアップロード" kr="이미지 업로드" />
            </label>
            <input
              id={`${uid}-image-file`}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="text-sm text-zinc-700 file:mr-3 file:rounded-full file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-800 dark:text-zinc-300 dark:file:bg-amber-900/40 dark:file:text-amber-300"
            />
          </div>
          {isProcessingImage && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <BilingualInline jp="画像を処理中..." kr="이미지 처리 중..." />
            </p>
          )}
          {(imagePreviewUrl || imageUrl) && !isProcessingImage && (
            <img
              src={imagePreviewUrl || imageUrl}
              alt="プレビュー / 미리보기"
              className="h-20 w-20 rounded-lg object-cover"
            />
          )}
        </div>
      )}

      {showRequired && (
        <div className="flex items-center gap-2">
          <input
            id={`${uid}-required`}
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-700"
          />
          <label htmlFor={`${uid}-required`} className="text-sm text-zinc-700 dark:text-zinc-300">
            <BilingualInline jp="必須項目にする" kr="필수 항목으로 설정" />
          </label>
        </div>
      )}

      {showRequireAll && (
        <div className="flex items-center gap-2">
          <input
            id={`${uid}-requireAll`}
            type="checkbox"
            checked={requireAll}
            onChange={(e) => setRequireAll(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-700"
          />
          <label htmlFor={`${uid}-requireAll`} className="text-sm text-zinc-700 dark:text-zinc-300">
            <BilingualInline
              jp="全ての選択肢にチェックしないと提出できないようにする"
              kr="전부 체크해야 제출 가능하게 하기"
            />
          </label>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-1 flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting || isProcessingImage}
          aria-label={isEditMode ? "項目更新 / 항목 수정" : "項目追加 / 항목 추가"}
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            isEditMode ? (
              <BilingualInline jp="更新中..." kr="수정 중..." />
            ) : (
              <BilingualInline jp="追加中..." kr="추가 중..." />
            )
          ) : isEditMode ? (
            <BilingualInline jp="更新する" kr="수정하기" />
          ) : (
            <BilingualInline jp="項目を追加" kr="항목 추가" />
          )}
        </button>
        {isEditMode && onDone && (
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <BilingualInline jp="キャンセル" kr="취소" />
          </button>
        )}
      </div>
    </form>
  );
}
