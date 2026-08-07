import { cookies } from "next/headers";
import { verifySessionToken, type SessionPayload } from "./auth";
import { getEnv } from "./env";

export async function getServerSession(): Promise<SessionPayload | null> {
  const env = getEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
