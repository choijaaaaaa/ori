// 브라우저에서 이미지를 리사이즈해 업로드용 Blob과 즉시 미리보기용 data URL을 만든다.
// Storage 업로드 전에 용량을 줄여두면 요청 크기와 저장 용량을 아낄 수 있다.
export async function resizeImageFile(
  file: File,
  { maxDimension = 1600, quality = 0.82 }: { maxDimension?: number; quality?: number } = {}
): Promise<{ blob: Blob; previewUrl: string }> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    el.src = rawDataUrl;
  });

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리할 수 없습니다.");
  ctx.drawImage(img, 0, 0, width, height);

  const previewUrl = canvas.toDataURL("image/jpeg", quality);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("이미지 변환에 실패했습니다."))),
      "image/jpeg",
      quality
    );
  });

  return { blob, previewUrl };
}

export async function uploadImage(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, "photo.jpg");

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message ?? "이미지 업로드에 실패했습니다.");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}
