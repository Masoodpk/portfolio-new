/**
 * Contact form validation, shared by the browser form and the API route
 * so both enforce exactly the same rules. Dependency-free on purpose:
 * it ships to the client.
 */
export type ContactInput = {
  name: string;
  email: string;
  company: string;
  message: string;
  /** Honeypot — real visitors never see or fill this */
  website: string;
};

export type ContactField = Exclude<keyof ContactInput, "website">;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const LIMITS = {
  name: { min: 2, max: 80 },
  company: { max: 100 },
  message: { min: 20, max: 2000 },
  email: { max: 254 },
} as const;

// Pragmatic check: something@something.tld, no spaces. Deliverability is the mail provider's job.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeContact(raw: unknown): ContactInput {
  const source = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const text = (key: string) => (typeof source[key] === "string" ? (source[key] as string).trim() : "");
  return {
    name: text("name"),
    email: text("email").toLowerCase(),
    company: text("company"),
    message: text("message"),
    website: text("website"),
  };
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  if (input.name.length < LIMITS.name.min) errors.name = "Please enter your name.";
  else if (input.name.length > LIMITS.name.max) errors.name = `Please keep your name under ${LIMITS.name.max} characters.`;

  if (!input.email) errors.email = "Please enter your email address.";
  else if (input.email.length > LIMITS.email.max || !EMAIL.test(input.email))
    errors.email = "Please enter a valid email address.";

  if (input.company.length > LIMITS.company.max)
    errors.company = `Please keep this under ${LIMITS.company.max} characters.`;

  if (input.message.length < LIMITS.message.min)
    errors.message = `Please write at least ${LIMITS.message.min} characters so I can understand the opportunity.`;
  else if (input.message.length > LIMITS.message.max)
    errors.message = `Please keep your message under ${LIMITS.message.max} characters.`;

  return errors;
}

export const isSpam = (input: ContactInput) => input.website.length > 0;

/** Response shape of POST /api/contact */
export type ContactResponse =
  | { ok: true }
  | { ok: false; error: "validation"; errors: ContactErrors }
  | { ok: false; error: "rate_limited" | "not_configured" | "send_failed" | "bad_request" };
