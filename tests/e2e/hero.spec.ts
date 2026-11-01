import { expect, test } from "@playwright/test";

const hero = "#home";

test.describe("hero", () => {
  test("shows name, headline and CTAs without waiting for 3D", async ({ page }) => {
    await page.goto("/");
    const section = page.locator(hero);
    await expect(section.getByRole("heading", { level: 1 })).toContainText("Masood");
    await expect(section.getByRole("link", { name: "Explore My Work" })).toBeVisible();
    await expect(section.getByRole("link", { name: "Download Resume" })).toBeVisible();
    await expect(section.getByRole("link", { name: "Let's Connect" })).toBeVisible();
  });

  test("loads the 3D hand and snaps when scrolled", async ({ page, isMobile }) => {
    await page.goto("/");
    const canvas = page.locator(`${hero} canvas`);
    if (isMobile) {
      // Phones only load 3D after the first interaction, keeping first load light.
      await page.waitForTimeout(1500);
      await expect(canvas).toHaveCount(0);
      await page.evaluate(() => window.scrollBy(0, 1));
    }
    await expect(canvas).toBeAttached({ timeout: 15_000 });
    await expect(page.locator(hero)).toHaveAttribute("data-snapped", "false");

    if (isMobile) {
      await canvas.scrollIntoViewIfNeeded();
      await page.mouse.wheel(0, 400);
    } else {
      await page.evaluate(() => window.scrollTo(0, document.querySelector("#home")!.clientHeight));
    }
    await expect(page.locator(hero)).toHaveAttribute("data-snapped", "true", { timeout: 5_000 });
  });

  test("never causes horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("hero fallbacks", () => {
  test("reduced motion: no WebGL, static poster, no scroll pin", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(hero)).toHaveAttribute("data-hand", "static", { timeout: 5_000 });
    await expect(page.locator(`${hero} canvas`)).toHaveCount(0);
    await expect(page.locator(`${hero} img[src*="hand-poster"]`)).toBeVisible();
    const { height, viewport } = await page.evaluate(() => ({
      height: document.querySelector("#home")!.clientHeight,
      viewport: window.innerHeight,
    }));
    expect(height).toBeLessThan(viewport * 1.6);
  });

  test("no WebGL: falls back to the poster", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      // @ts-expect-error -- simplified override for the test
      HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
        if (type.startsWith("webgl")) return null;
        return original.call(this, type as "2d", ...(rest as []));
      };
    });
    await page.goto("/");
    // Phones only probe WebGL once the visitor interacts.
    await page.evaluate(() => window.scrollBy(0, 1));
    await expect(page.locator(hero)).toHaveAttribute("data-hand", "static", { timeout: 5_000 });
    await expect(page.locator(`${hero} canvas`)).toHaveCount(0);
    await expect(page.locator(`${hero} img[src*="hand-poster"]`)).toBeVisible();
  });
});
