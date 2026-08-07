import { cookies } from "next/headers";
import { apiOk } from "@/lib/api-response";
import { verifySessionToken } from "@/lib/auth";
import { getEnv } from "@/lib/env";

export async function GET() {
  const env = getEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return apiOk({ authenticated: false });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return apiOk({ authenticated: false });
  }

  return apiOk({ authenticated: true, email: session.email });
}
