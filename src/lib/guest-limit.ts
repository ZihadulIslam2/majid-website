import { get, set } from "idb-keyval";

const DEVICE_ID_KEY = "imoscan_guest_device_id";
const USAGE_COUNT_KEY = "imoscan_guest_usage_count";

export async function getOrCreateDeviceId(): Promise<string> {
  if (typeof window === "undefined") return "";
  let deviceId = await get<string>(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
    await set(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export async function getGuestUsageCount(): Promise<number> {
  if (typeof window === "undefined") return 0;
  const deviceId = await getOrCreateDeviceId();
  const count = await get<number>(`${USAGE_COUNT_KEY}_${deviceId}`);
  return count || 0;
}

export async function incrementGuestUsageCount(): Promise<number> {
  if (typeof window === "undefined") return 0;
  const deviceId = await getOrCreateDeviceId();
  const currentCount = await getGuestUsageCount();
  const newCount = currentCount + 1;
  await set(`${USAGE_COUNT_KEY}_${deviceId}`, newCount);
  return newCount;
}
