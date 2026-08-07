import { randomUUID } from "crypto";
import { readDataFile, writeDataFile } from "./data-dir";

// 비밀번호는 mock 단계에서 admin-auth.json에 해시로 저장한다.
// Vercel 서버리스 환경은 인스턴스가 재활용되지 않으면 초기화되므로 변경한 비밀번호가
// 영구 저장되지 않는다 — Supabase 연동 전까지의 임시 구현.
const AUTH_FILE = "admin-auth.json";

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
  const raw = await readDataFile(AUTH_FILE);
  const parsed = (raw ? JSON.parse(raw) : {}) as Partial<AdminAuth>;
  if (parsed.passwordHash && parsed.salt) {
    return parsed as AdminAuth;
  }

  const initialPassword = process.env.ADMIN_PASSWORD;
  if (!initialPassword) {
    throw new Error("ADMIN_PASSWORD 환경변수가 설정되어 있지 않습니다.");
  }
  const salt = randomUUID();
  const passwordHash = await sha256Hex(`${salt}:${initialPassword}`);
  const auth: AdminAuth = { passwordHash, salt };
  await writeDataFile(AUTH_FILE, JSON.stringify(auth, null, 2));
  return auth;
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
  await writeDataFile(AUTH_FILE, JSON.stringify({ passwordHash, salt }, null, 2));
  return true;
}
