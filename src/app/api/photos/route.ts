// 사진 갤러리 목록 조회(공개) / 추가(관리자 전용) API
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const items = await repository.listPhotos();
    return NextResponse.json(items);
  } catch (error) {
    console.error("사진 목록 조회 실패", error);
    return internalErrorResponse("사진 목록을 불러오는 중 오류가 발생했습니다.");
  }
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

  try {
    // url은 /api/upload로 먼저 Storage에 올린 뒤 받은 공개 URL(또는 갤러리에서 재사용한 기존 URL)이다.
    const created = await repository.addPhoto({ url, caption: caption || undefined });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("사진 등록 실패", error);
    return internalErrorResponse("사진 등록 중 오류가 발생했습니다.");
  }
}
