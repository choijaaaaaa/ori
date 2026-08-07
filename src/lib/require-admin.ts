import { cookies } from "next/headers";
import { ADMIN_COOKIE, getSessionTokenValue } from "./session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  const expected = await getSessionTokenValue();
  return cookie === expected;
}
