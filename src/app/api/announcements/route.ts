// 공지사항 목록 조회(공개) / 생성(관리자 전용) API
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";

export async function GET() {
  const items = await repository.listAnnouncements();
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
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!title || !content) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "제목과 내용을 모두 입력해주세요." } },
      { status: 400 }
    );
  }

  const created = await repository.createAnnouncement({ title, content });
  return NextResponse.json(created, { status: 201 });
}
