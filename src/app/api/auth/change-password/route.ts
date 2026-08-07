import { NextResponse } from "next/server";
import { changeAdminPassword } from "@/lib/auth";
import { isAdminAuthenticated } from "@/lib/require-admin";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." } },
      { status: 400 }
    );
  }
  if (newPassword.length < 4) {
    return NextResponse.json(
      { error: { code: "PASSWORD_TOO_SHORT", message: "새 비밀번호는 4자 이상이어야 합니다." } },
      { status: 400 }
    );
  }

  const ok = await changeAdminPassword(currentPassword, newPassword);
  if (!ok) {
    return NextResponse.json(
      { error: { code: "INVALID_PASSWORD", message: "현재 비밀번호가 올바르지 않습니다." } },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
