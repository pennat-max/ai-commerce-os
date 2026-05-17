export type EmailResult = { ok: boolean; error?: string; mode: "live" | "mock" };

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "AI Commerce OS <onboarding@resend.dev>";

  if (!apiKey) {
    return { ok: true, mode: "mock", error: "RESEND_API_KEY not set" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [options.to],
      subject: options.subject,
      text: options.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { ok: false, mode: "live", error: body || response.statusText };
  }

  return { ok: true, mode: "live" };
}
