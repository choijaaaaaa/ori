// 참가자 메모 조회/추가 API — 개인정보 성격이 있어 전부 관리자 전용
import { NextResponse } from "next/server";
import { repository } from "@/lib/repository";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { internalErrorResponse } from "@/lib/api-error";

export async function GET(request: Request) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "관리자 인증이 필요합니다." } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();

  if (!name) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "참가자 이름(name)이 필요합니다." } },
      { status: 400 }
    );
  }

  try {
    const items = await repository.listNotesByParticipant(name);
    return NextResponse.json(items);
  } catch (error) {
    console.error("참가자 메모 조회 실패", error);
    return internalErrorResponse("메모를 불러오는 중 오류가 발생했습니다.");
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
  const participantName =
    typeof body?.participantName === "string" ? body.participantName.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((t: unknown): t is string => typeof t === "string" && t.trim().length > 0)
    : [];

  if (!participantName || !note) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "참가자 이름과 메모 내용을 입력해주세요." } },
      { status: 400 }
    );
  }

  try {
    const created = await repository.addNote({ participantName, note, tags });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("참가자 메모 등록 실패", error);
    return internalErrorResponse("메모 등록 중 오류가 발생했습니다.");
  }
}
