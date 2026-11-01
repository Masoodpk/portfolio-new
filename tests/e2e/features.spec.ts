import { expect, test } from "@playwright/test";
import { projects } from "../../src/content/projects";

test.describe("projects", () => {
  for (const project of projects) {
    test(`case study for ${project.name} renders and links back`, async ({ page }) => {
      await page.goto(`/projects/${project.slug}`);
      await expect(page).toHaveTitle(new RegExp(project.name));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.name);
      await expect(page.getByRole("heading", { name: "My role" })).toBeVisible();
      await expect(page.getByText(project.caseStudy.note)).toBeVisible();

      // Header nav must point back to home-page sections from here.
      await expect(page.locator('header a[href="/#contact"]').first()).toBeAttached();
    });
  }

  test("home cards open the case study", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Read case study.*Easify/ }).click();
    await expect(page).toHaveURL(/\/projects\/easify$/);
  });

  test("unknown project returns 404", async ({ page }) => {
    const response = await page.goto("/projects/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  });
});

test.describe("contact form", () => {
  test("validates required fields and focuses the first error", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByLabel(/^Name/)).toBeFocused();
    await expect(page.getByText("Please enter your name.")).toBeVisible();
    await expect(page.getByLabel(/^Email/)).toHaveAttribute("aria-invalid", "true");
  });

  test("falls back to email when delivery is not configured", async ({ page }) => {
    await page.route("/api/contact", (route) =>
      route.fulfill({ status: 503, json: { ok: false, error: "not_configured" } }),
    );
    await page.goto("/");
    await page.getByLabel(/^Name/).fill("Test Recruiter");
    await page.getByLabel(/^Email/).fill("recruiter@example.com");
    await page.getByLabel(/^Message/).fill("We have a frontend role you may be interested in.");
    await page.getByRole("button", { name: "Send message" }).click();
    const alert = page.getByRole("alert").filter({ hasText: "email" });
    await expect(alert).toContainText("isn't connected to email yet");
    await expect(alert.getByRole("link", { name: /@gmail\.com/ })).toBeVisible();
  });

  test("shows success when the message is sent", async ({ page }) => {
    await page.route("/api/contact", (route) => route.fulfill({ status: 200, json: { ok: true } }));
    await page.goto("/");
    await page.getByLabel(/^Name/).fill("Test Recruiter");
    await page.getByLabel(/^Email/).fill("recruiter@example.com");
    await page.getByLabel(/^Message/).fill("We have a frontend role you may be interested in.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("status").getByText("Message sent.")).toBeVisible();
  });
});

test.describe("skills", () => {
  test("highlights a category and labels how each skill was used", async ({ page }) => {
    await page.goto("/");
    const apis = page.getByRole("button", { name: "APIs", exact: true });
    await apis.click();
    await expect(apis).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#skills")).toContainText("GraphQL, Studied & personal projects");
    await apis.click();
    await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("theme", () => {
  test("switches between light and dark and remembers the choice", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  });

  test("follows the system setting on a first visit", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});

test.describe("downloads and links", () => {
  test("CV is a real PDF", async ({ request }) => {
    const response = await request.get("/cv/Masood-PK-Software-Developer-CV.pdf");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
  });

  test("every in-page navigation link has a matching section", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator('header nav[aria-label="Primary"] a').evaluateAll((links) =>
      links.map((a) => a.getAttribute("href")),
    );
    for (const href of hrefs) {
      expect(await page.locator(href!).count()).toBe(1);
    }
  });
});
