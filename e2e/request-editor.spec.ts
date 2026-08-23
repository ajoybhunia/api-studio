import { test, expect } from "@playwright/test";

test.describe("Request Editor", () => {
  test("creates new request and navigates to editor", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await expect(page.getByRole("combobox")).toBeVisible();
    await expect(page.getByPlaceholder("Enter request URL")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("allows entering URL and enabling send", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com");
    await expect(page.getByRole("button", { name: "Send" })).toBeEnabled();
  });

  test("allows changing HTTP method", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    const select = page.getByRole("combobox");
    await expect(select).toHaveValue("GET");

    await select.selectOption("POST");
    await expect(select).toHaveValue("POST");
  });
});
