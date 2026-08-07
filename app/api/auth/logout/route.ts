import { cookies } from "next/headers";
import { apiOk } from "@/lib/api-response";
import { getEnv } from "@/lib/env";

export async function POST() {
  const env = getEnv();
  const cookieStore = await cookies();
  cookieStore.delete(env.SESSION_COOKIE_NAME);
  return apiOk({ loggedOut: true });
}
