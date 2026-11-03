import { expect, test } from "@playwright/test";
import { projects } from "../../src/data/content";

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
    // Smooth scrolling off: Playwright jumps to elements, which Lenis would then glide past.
    await page.emulateMedia({ reducedMotion: "reduce" });
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
  // Smooth scrolling off: Playwright jumps to elements, which Lenis would then glide past.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

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
  test("labels how each skill was used", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#skills")).toContainText("GraphQL, studied & personal projects");
    await expect(page.locator("#skills")).toContainText("Vue.js, used at work");
  });
});

test.describe("journey", () => {
  test("has one section per chapter, in the order the camera flies", async ({ page }) => {
    await page.goto("/");
    const order = await page.locator("[data-chapter]").evaluateAll((sections) => sections.map((s) => s.getAttribute("data-chapter")));
    expect(order).toEqual(["home", "flight", "about", "skills", "projects", "experience", "contact"]);
  });

  test("draws the 3D world behind the page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas").first()).toBeAttached({ timeout: 15_000 });
    // The 3D name is the visible title; the h1 remains for search and screen readers.
    await expect(page.getByRole("heading", { level: 1, name: "Masood PK" })).toBeAttached();
  });

  test("with reduced motion the forest is shown as painted stills, not flown through", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".world-layer img").first()).toHaveAttribute("src", "/stills/home.webp");
    await expect(page.locator("canvas")).toHaveCount(0);
    // The HTML title stands in for the 3D one
    await expect(page.getByRole("heading", { level: 1, name: "Masood PK" })).toBeVisible();
  });

  test("the loader steps aside once the forest is ready", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".loader")).toHaveCount(0, { timeout: 20_000 });
  });

  test("the forest sound is off until turned on", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Forest sound" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("with reduced motion the content is shown without fades", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByText("Scroll to start")).toBeVisible();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: /Let's build something together/ })).toBeVisible();
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
    const hrefs = await page.locator('header nav[aria-label="Chapters"] a').evaluateAll((links) =>
      links.map((a) => a.getAttribute("href")),
    );
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs.filter((h) => h !== "/")) {
      expect(await page.locator(href!.replace(/^\//, "")).count()).toBe(1);
    }
  });
});
