// Staff 소개 목록 공개 조회(GET) + 관리자 스태프 추가(POST) API
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const items = await repository.listStaffMembers();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Staff 목록 조회 실패", error);
    return internalErrorResponse("Staff 목록을 불러오는 중 오류가 발생했습니다.");
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
  const bio = typeof body?.bio === "string" ? body.bio.trim() : "";

  if (!name) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "이름을 입력해주세요." } },
      { status: 400 }
    );
  }

  try {
    const created = await repository.createStaffMember({
      name,
      imageUrl: imageUrl || undefined,
      bio: bio || undefined,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Staff 추가 실패", error);
    return internalErrorResponse("Staff 추가 중 오류가 발생했습니다.");
  }
}
