import { promises as fs } from "fs";
import os from "os";
import path from "path";

// Vercel 등 서버리스 배포본은 프로젝트 디렉토리가 읽기 전용이라 그 안에 fs.writeFile을 하면
// 실패한다. /tmp만 쓰기가 가능하므로, 배포 환경에서는 최초 요청 시 시드 데이터를 /tmp로
// 복사해두고 이후 읽기/쓰기는 전부 /tmp에서 처리한다. Supabase 연동 전까지의 임시 구조이며,
// /tmp는 서버리스 인스턴스별로 격리·휘발되므로 여러 인스턴스 간 데이터가 일치하지 않을 수 있다.
const SEED_DIR = path.join(process.cwd(), "data");
const WRITABLE_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "ori-data")
  : SEED_DIR;

async function ensureSeeded(file: string): Promise<void> {
  if (WRITABLE_DIR === SEED_DIR) return;
  const target = path.join(WRITABLE_DIR, file);
  try {
    await fs.access(target);
  } catch {
    await fs.mkdir(WRITABLE_DIR, { recursive: true });
    const seedRaw = await fs.readFile(path.join(SEED_DIR, file), "utf-8").catch(() => null);
    await fs.writeFile(target, seedRaw ?? "", "utf-8");
  }
}

export async function readDataFile(file: string): Promise<string> {
  await ensureSeeded(file);
  return fs.readFile(path.join(WRITABLE_DIR, file), "utf-8");
}

export async function writeDataFile(file: string, content: string): Promise<void> {
  await ensureSeeded(file);
  await fs.mkdir(WRITABLE_DIR, { recursive: true });
  await fs.writeFile(path.join(WRITABLE_DIR, file), content, "utf-8");
}
