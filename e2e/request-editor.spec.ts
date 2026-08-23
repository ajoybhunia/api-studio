import { test, expect } from "@playwright/test";
import { tauriMockScript, tauriMockScriptSlow } from "./helpers/tauri-mock";

test.describe("Request Editor", () => {
  test("creates new request and navigates to editor", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await expect(page.getByRole("button", { name: "GET" })).toBeVisible();
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

    const dropdown = page.getByRole("button", { name: "GET" });
    await expect(dropdown).toHaveText("GET");

    await dropdown.click();
    await page.getByRole("option", { name: "POST" }).click();
    await expect(page.getByRole("button", { name: "POST" })).toBeVisible();
  });
});

test.describe("Response Panel States", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript() });
  });

  test("shows default empty state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await expect(
      page.getByText("Send a request to see the response"),
    ).toBeVisible();
  });

  test("shows loading state", async ({ page }) => {
    await page.addInitScript({ content: tauriMockScriptSlow() });
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Sending request...")).toBeVisible();
  });

  test("shows success response", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("200")).toBeVisible();
    await expect(page.getByText("42ms")).toBeVisible();
    await expect(page.getByText("Mock response")).toBeVisible();
  });

  test("shows error state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/error");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("timeout")).toBeVisible();
    await expect(page.getByText("Request timed out")).toBeVisible();
  });
});
