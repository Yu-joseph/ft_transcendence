// src/auth/identity.ts
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth:8000";

export async function getUserIdFromToken(token: string): Promise<string | null> {
  const res = await fetch(AUTH_SERVICE_URL + "/protected/", {
    method: "GET",
    headers: { Cookie: "access_token=" + encodeURIComponent(token) },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { user_id?: string };
  return data.user_id ?? null;
}