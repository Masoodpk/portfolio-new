import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = ["/", "/projects/easify", "/projects/brew-your-brand", "/this-page-does-not-exist"];

for (const path of pages) for (const colorScheme of ["light", "dark"] as const) {
  test(`no WCAG 2.2 AA violations on ${path} (${colorScheme})`, async ({ page }) => {
    // Reduced motion settles animations before auditing; the scheme picks the theme.
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme });
    await page.goto(path);
    await page.waitForLoadState("load");
    const results = await new AxeBuilder({ page })
      // Run in-page: the site has no iframes, and the cross-frame mode opens an
      // extra browser context that can stall under parallel load.
      .setLegacyMode(true)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
    }));
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}

test("keyboard users can skip to content and see focus", async ({ page, isMobile }) => {
  test.skip(isMobile, "Keyboard navigation is a desktop concern");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});
