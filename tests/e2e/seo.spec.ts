import { expect, test } from "@playwright/test";
import { projects } from "../../src/content/projects";

test.describe("seo", () => {
  test.skip(({ isMobile }) => isMobile, "Server output is identical across devices");

  test("home has title, description, canonical, OG and valid JSON-LD", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Masood PK — Software Developer/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Vue\.js/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\//);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator("h1")).toHaveCount(1);

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.flatMap((block) => JSON.parse(block)["@graph"].map((node: { "@type": string }) => node["@type"]));
    expect(types).toEqual(expect.arrayContaining(["WebSite", "ProfilePage", "Person"]));
  });

  test("case studies have their own canonical and breadcrumb data", async ({ page }) => {
    for (const project of projects) {
      await page.goto(`/projects/${project.slug}`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/projects/${project.slug}$`));
      const [block] = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(JSON.parse(block)["@graph"][0]["@type"]).toBe("BreadcrumbList");
    }
  });

  test("sitemap and robots list the right URLs", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const project of projects) expect(sitemap).toContain(`/projects/${project.slug}</loc>`);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
    expect(robots).toContain("Disallow: /api/");
  });

  test("social images render", async ({ request }) => {
    for (const path of ["/opengraph-image", `/projects/${projects[0].slug}/opengraph-image`]) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe("image/png");
    }
  });

  test("security headers are set", async ({ request }) => {
    const headers = (await request.get("/")).headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});
