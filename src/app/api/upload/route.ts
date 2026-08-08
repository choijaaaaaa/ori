// 관리자 전용 이미지 업로드 — Supabase Storage에 저장하고 공개 URL을 반환한다.
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase, PHOTOS_BUCKET } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/require-admin";

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

  const arrayBuffer = await file.arrayBuffer();
  const path = `${randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type || "image/jpeg", upsert: false });

  if (error) {
    return NextResponse.json(
      { error: { code: "UPLOAD_FAILED", message: error.message } },
      { status: 500 }
    );
  }

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
