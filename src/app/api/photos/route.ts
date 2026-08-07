// 사진 갤러리 목록 조회(공개) / 추가(관리자 전용) API
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";

export async function GET() {
  const items = await repository.listPhotos();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "관리자 인증이 필요합니다." } },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const caption = typeof body?.caption === "string" ? body.caption.trim() : "";

  if (!url) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "사진 URL을 입력해주세요." } },
      { status: 400 }
    );
  }

  // 지금은 URL 직접 입력 방식(mock) — 추후 Supabase Storage 업로드로 교체 예정.
  const created = await repository.addPhoto({ url, caption: caption || undefined });
  return NextResponse.json(created, { status: 201 });
}
