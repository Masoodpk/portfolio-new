import { describe, expect, it } from "vitest";
import { isSpam, normalizeContact, validateContact } from "@/lib/contact";

const valid = {
  name: "Aisha Rahman",
  email: "Aisha@Example.com ",
  company: "Acme",
  message: "We are hiring a frontend developer for our product team.",
  website: "",
};

describe("normalizeContact", () => {
  it("trims strings and lower-cases the email", () => {
    const input = normalizeContact(valid);
    expect(input.email).toBe("aisha@example.com");
    expect(input.name).toBe("Aisha Rahman");
  });

  it("treats missing or non-string fields as empty", () => {
    expect(normalizeContact({ name: 42, email: null })).toEqual({
      name: "",
      email: "",
      company: "",
      message: "",
      website: "",
    });
    expect(normalizeContact("nope").name).toBe("");
  });
});

describe("validateContact", () => {
  it("accepts a complete message", () => {
    expect(validateContact(normalizeContact(valid))).toEqual({});
  });

  it("flags every required field when empty", () => {
    const errors = validateContact(normalizeContact({}));
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
  });

  it.each(["plainaddress", "a@b", "a b@c.com", "@example.com"])("rejects invalid email %s", (email) => {
    expect(validateContact(normalizeContact({ ...valid, email })).email).toBeDefined();
  });

  it("enforces length limits", () => {
    const errors = validateContact(
      normalizeContact({ ...valid, name: "x".repeat(81), message: "y".repeat(2001), company: "z".repeat(101) }),
    );
    expect(errors.name).toBeDefined();
    expect(errors.message).toBeDefined();
    expect(errors.company).toBeDefined();
  });

  it("requires a meaningful message", () => {
    expect(validateContact(normalizeContact({ ...valid, message: "hi" })).message).toBeDefined();
  });
});

describe("isSpam", () => {
  it("detects a filled honeypot", () => {
    expect(isSpam(normalizeContact({ ...valid, website: "http://spam.example" }))).toBe(true);
    expect(isSpam(normalizeContact(valid))).toBe(false);
  });
});
