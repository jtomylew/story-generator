import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const DEVICE_ID_COOKIE = "deviceId";
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60; // 400 days in seconds

export async function getOrCreateDeviceId(): Promise<string> {
  const cookieStore = await cookies();
  let deviceId = cookieStore.get(DEVICE_ID_COOKIE)?.value;

  if (!deviceId) {
    deviceId = randomUUID();
    cookieStore.set(DEVICE_ID_COOKIE, deviceId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return deviceId;
}
