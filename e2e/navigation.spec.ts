import { test, expect } from "@playwright/test";

test.describe("API Studio shell", () => {
  test("loads the dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Welcome to API Studio" }),
    ).toBeVisible();
  });

  test("navigates via the sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Collections" }).click();
    await expect(
      page.getByRole("heading", { name: "Collections" }),
    ).toBeVisible();
  });

  test("toggles the theme", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(html).toHaveClass(/dark/);
  });
});
