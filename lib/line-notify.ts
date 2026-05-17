export type LineNotifyResult = { ok: boolean; error?: string; mode: "live" | "mock" };

export async function sendLineNotify(message: string): Promise<LineNotifyResult> {
  const token = process.env.LINE_NOTIFY_TOKEN;

  if (!token) {
    return { ok: true, mode: "mock", error: "LINE_NOTIFY_TOKEN not set — logged only" };
  }

  const response = await fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ message }),
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, mode: "live", error: text || response.statusText };
  }

  return { ok: true, mode: "live" };
}
