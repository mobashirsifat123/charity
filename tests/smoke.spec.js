import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/blog-grid",
  "/fatwa",
  "/ebooks",
  "/quran",
  "/quran/1",
  "/quran/tafseer",
  "/request-fatwa",
  "/donation",
];

async function expectHealthyPage(page, path) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.status(), `${path} should load`).toBeLessThan(500);
  await expect(page.locator("body")).toBeVisible();
  await expect(page.getByText("Oops!")).toHaveCount(0);
  await expect(page.getByText("Something went wrong.")).toHaveCount(0);
}

test.describe("public site smoke", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} loads without runtime error`, async ({ page }) => {
      await expectHealthyPage(page, route);
    });
  }

  test("homepage keeps core actions reachable on mobile and desktop", async ({
    page,
  }) => {
    await expectHealthyPage(page, "/");

    await expect(page.locator('a[href="/blog-grid"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href="/fatwa"]:visible').first()).toBeVisible();
    await expect(
      page.getByPlaceholder(/search articles|quran topics/i).first(),
    ).toBeVisible();
  });

  test("member dashboard route is guarded but stable", async ({ page }) => {
    await expectHealthyPage(page, "/dashboard");
  });

  test("admin route is guarded but stable", async ({ page }) => {
    await expectHealthyPage(page, "/admin");
    await expect(page.locator("body")).toContainText(/login|sign in|admin/i);
  });
});
