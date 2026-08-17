// 관리자 전용 이미지 업로드 — Supabase Storage에 저장하고 공개 URL을 반환한다.
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase, PHOTOS_BUCKET } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/require-admin";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB, 클라이언트 리사이즈 로직과 동일한 상한
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "파일이 필요합니다." } },
      { status: 400 }
    );
  }

  // 브라우저가 보낸 Content-Type은 클라이언트가 주장하는 값일 뿐 실제 내용을 보장하지 않지만,
  // 최소한 이미지가 아니라고 스스로 밝힌 파일은 여기서 걸러 Storage까지 안 보낸다.
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: { code: "INVALID_FILE_TYPE", message: "이미지 파일만 업로드할 수 있습니다." } },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: { code: "FILE_TOO_LARGE", message: "파일 용량이 너무 큽니다 (최대 15MB)." } },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const path = `${randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json(
      { error: { code: "UPLOAD_FAILED", message: error.message } },
      { status: 400 }
    );
  }

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
