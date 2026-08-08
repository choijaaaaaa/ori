import { randomUUID } from "crypto";
import { supabase } from "./supabase";

// 관리자 비밀번호 해시는 admin_auth 테이블(단일 행, id=1)에 저장한다.
interface AdminAuth {
  passwordHash: string;
  salt: string;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function readAuth(): Promise<AdminAuth> {
  const { data, error } = await supabase
    .from("admin_auth")
    .select("password_hash, salt")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (data) {
    return { passwordHash: data.password_hash, salt: data.salt };
  }

  const initialPassword = process.env.ADMIN_PASSWORD;
  if (!initialPassword) {
    throw new Error("ADMIN_PASSWORD 환경변수가 설정되어 있지 않습니다.");
  }
  const salt = randomUUID();
  const passwordHash = await sha256Hex(`${salt}:${initialPassword}`);
  const { error: insertError } = await supabase
    .from("admin_auth")
    .insert({ id: 1, password_hash: passwordHash, salt });
  if (insertError) throw new Error(insertError.message);
  return { passwordHash, salt };
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const auth = await readAuth();
  const hash = await sha256Hex(`${auth.salt}:${password}`);
  return hash === auth.passwordHash;
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const auth = await readAuth();
  const currentHash = await sha256Hex(`${auth.salt}:${currentPassword}`);
  if (currentHash !== auth.passwordHash) {
    return false;
  }
  const salt = randomUUID();
  const passwordHash = await sha256Hex(`${salt}:${newPassword}`);
  const { error } = await supabase
    .from("admin_auth")
    .update({ password_hash: passwordHash, salt })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  return true;
}
