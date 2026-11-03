"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import {
  LIMITS,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactResponse,
} from "@/lib/contact";
import { profile } from "@/data/content";

type Status = "idle" | "sending" | "sent" | "error" | "unavailable";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});

  const read = () => normalizeContact(Object.fromEntries(new FormData(formRef.current!)));

  // Validate a field once the visitor leaves it, then live while they fix it.
  const revalidate = (field: ContactField, force = false) => {
    if (!force && !touched[field]) return;
    const next = validateContact(read());
    setErrors((previous) => ({ ...previous, [field]: next[field] }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    const input = read();
    const found = validateContact(input);
    setErrors(found);
    setTouched({ name: true, email: true, company: true, message: true });
    const firstInvalid = (Object.keys(found) as ContactField[])[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = (await response.json()) as ContactResponse;
      if (result.ok) {
        setStatus("sent");
        formRef.current?.reset();
        setTouched({});
      } else if (result.error === "validation") {
        setErrors(result.errors);
        setStatus("idle");
      } else {
        setStatus(result.error === "not_configured" ? "unavailable" : "error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="flex h-full flex-col justify-center py-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-leaf text-jungle" aria-hidden="true">
          <Check className="size-6" />
        </span>
        <h4 className="font-display mt-6 text-5xl text-ink">Message sent.</h4>
        <p className="mt-3 max-w-[40ch] leading-relaxed text-ink-soft">
          Thank you for reaching out — I&apos;ll reply to the email address you provided.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="link-line mt-8 self-start text-sm text-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-label="Contact form"
      className="flex flex-col gap-7"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field
          name="name"
          label="Name"
          autoComplete="name"
          maxLength={LIMITS.name.max}
          error={errors.name}
          onBlur={() => {
            setTouched((t) => ({ ...t, name: true }));
            revalidate("name", true);
          }}
          onInput={() => revalidate("name")}
        />
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          maxLength={LIMITS.email.max}
          error={errors.email}
          onBlur={() => {
            setTouched((t) => ({ ...t, email: true }));
            revalidate("email", true);
          }}
          onInput={() => revalidate("email")}
        />
      </div>
      <Field
        name="company"
        label="Company"
        optional
        autoComplete="organization"
        maxLength={LIMITS.company.max}
        error={errors.company}
        onBlur={() => revalidate("company", true)}
      />
      <Field
        name="message"
        label="Message"
        multiline
        maxLength={LIMITS.message.max}
        hint="The role, team or challenge you have in mind."
        error={errors.message}
        onBlur={() => {
          setTouched((t) => ({ ...t, message: true }));
          revalidate("message", true);
        }}
        onInput={() => revalidate("message")}
      />

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group/send btn btn--solid disabled:cursor-progress disabled:opacity-70"
        >
          {status === "sending" ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              Send message
              <ArrowRight className="size-4 transition-transform group-hover/send:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </button>
        <p className="text-xs text-muted">Your details are only used to reply to you.</p>
      </div>

      <div aria-live="assertive" className="empty:hidden">
        {status === "error" || status === "unavailable" ? (
          <p role="alert" className="rounded-2xl bg-blush/20 p-4 text-sm leading-relaxed text-ink ring-1 ring-line-strong">
            {status === "unavailable"
              ? "The form isn't connected to email yet. "
              : "Something went wrong sending your message. "}
            Please email me directly at{" "}
            <a href={`mailto:${profile.email}`} className="font-medium text-ink underline underline-offset-4 hover:text-accent">
              {profile.email}
            </a>
            .
          </p>
        ) : null}
      </div>
    </form>
  );
}

type FieldProps = {
  name: ContactField;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  multiline?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "text";
  maxLength: number;
  onBlur?: () => void;
  onInput?: () => void;
};

function Field({ name, label, error, hint, optional, multiline, type = "text", ...rest }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control =
    "mt-2 w-full rounded-2xl border bg-paper/60 px-4 py-3 text-base text-ink outline-none transition-[border-color,box-shadow] duration-500 placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_4px_var(--color-line)] " +
    (error ? "border-danger" : "border-line-strong");

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="eyebrow flex justify-between text-ink-soft">
        <span>
          {label}
          {optional ? null : <span aria-hidden="true" className="text-accent"> *</span>}
        </span>
        {optional ? <span className="normal-case tracking-normal text-muted">Optional</span> : null}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          required={!optional}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${control} resize-y`}
          {...rest}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={!optional}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={control}
          {...rest}
        />
      )}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-2 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
