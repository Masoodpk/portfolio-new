import { isSpam, normalizeContact, validateContact, type ContactResponse } from "@/lib/contact";

/**
 * Sends contact-form messages through Resend's HTTP API.
 * Needs RESEND_API_KEY and CONTACT_TO_EMAIL (server-only, never NEXT_PUBLIC_).
 * Without them it answers 503 and the form falls back to a mailto link.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Best-effort, per-instance limit. Serverless instances don't share memory;
// use a shared store (e.g. Upstash) if abuse becomes a real problem.
const hits = new Map<string, number[]>();

function rateLimited(key: string, now: number) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const json = (body: ContactResponse, status: number) => Response.json(body, { status });

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "bad_request" }, 415);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const input = normalizeContact(raw);
  // Pretend success so bots learn nothing.
  if (isSpam(input)) return json({ ok: true }, 200);

  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) return json({ ok: false, error: "validation", errors }, 422);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip, Date.now())) return json({ ok: false, error: "rate_limited" }, 429);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return json({ ok: false, error: "not_configured" }, 503);

  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";
  const lines = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.company ? `Company: ${input.company}` : null,
    "",
    input.message,
  ].filter((line) => line !== null);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `Portfolio enquiry from ${input.name}`.slice(0, 120),
        // Plain text only — visitor input is never rendered as HTML.
        text: lines.join("\n"),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error("Contact email failed", response.status, await response.text().catch(() => ""));
      return json({ ok: false, error: "send_failed" }, 502);
    }
  } catch (error) {
    console.error("Contact email failed", error);
    return json({ ok: false, error: "send_failed" }, 502);
  }

  return json({ ok: true }, 200);
}
