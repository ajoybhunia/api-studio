import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { tauriMockScript, tauriMockScriptSlow } from "./helpers/tauri-mock";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
);

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

  test("shows editor tabs", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await expect(page.getByRole("button", { name: "Params" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Body" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Auth" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Headers" })).toBeVisible();
  });
});

test.describe("Sidebar Request List", () => {
  test("creates request from sidebar plus button", async ({ page }) => {
    await page.goto("/");
    await page.getByTitle("New Request").click();
    await expect(page.getByRole("button", { name: "GET" })).toBeVisible();
    await expect(page.getByText("Untitled")).toBeVisible();
  });

  test("shows request in sidebar after creation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/users");
    await expect(page.getByText("/users")).toBeVisible();
  });

  test("switches between requests via sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/users");

    await page.getByTitle("New Request").click();
    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/posts");

    const sidebar = page.locator("aside");
    await sidebar.getByText("/users").click();
    const input = page.getByPlaceholder("Enter request URL");
    await expect(input).toHaveValue("https://api.example.com/users");
  });

  test("deletes request from sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await expect(page.getByText("Untitled")).toBeVisible();

    const requestItem = page.locator("li").filter({ hasText: "Untitled" });
    await requestItem.hover();
    await requestItem.getByTitle("Delete request").click({ force: true });

    await expect(page.getByText("Untitled")).not.toBeVisible();
  });
});

test.describe("Query Params", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
  });

  test("adds query param and updates url", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/users");

    await page.getByRole("button", { name: "Params" }).click();
    await page.getByText("+ Add param").click();

    await page.getByPlaceholder("Key").fill("page");
    await page.getByPlaceholder("Value").fill("1");

    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("200")).toBeVisible();
  });

  test("shows preview URL when params are added", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/users");

    await expect(page.getByText("Preview:")).not.toBeVisible();

    await page.getByRole("button", { name: "Params" }).click();
    await page.getByText("+ Add param").click();
    await page.getByPlaceholder("Key").fill("page");
    await page.getByPlaceholder("Value").fill("1");

    await expect(page.getByText("Preview:")).toBeVisible();
    await expect(
      page.getByText("https://api.example.com/users?page=1"),
    ).toBeVisible();

    await page.getByText("+ Add param").click();
    const keyInputs = page.getByPlaceholder("Key");
    const valueInputs = page.getByPlaceholder("Value");
    await keyInputs.nth(1).fill("limit");
    await valueInputs.nth(1).fill("10");

    await expect(page.getByText(/page=1&limit=10/)).toBeVisible();
  });

  test("excludes disabled params from preview URL", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com");

    await page.getByRole("button", { name: "Params" }).click();

    await page.getByText("+ Add param").click();
    await page.getByPlaceholder("Key").fill("page");
    await page.getByPlaceholder("Value").fill("1");

    await page.getByText("+ Add param").click();
    const keyInputs = page.getByPlaceholder("Key");
    const valueInputs = page.getByPlaceholder("Value");
    await keyInputs.nth(1).fill("debug");
    await valueInputs.nth(1).fill("true");

    const checkboxes = page.locator("input[type='checkbox']");
    await checkboxes.nth(1).uncheck();

    await expect(
      page.getByText("https://api.example.com?page=1"),
    ).toBeVisible();
    await expect(page.getByText(/debug/)).not.toBeVisible();
  });
});

test.describe("Headers Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
  });

  test("adds header row", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com");

    await page.getByRole("button", { name: "Headers" }).click();
    await page.getByText("+ Add header").click();

    await page.getByPlaceholder("Key").last().fill("X-Custom");
    await page.getByPlaceholder("Value").last().fill("test-value");

    const keyInput = page.getByPlaceholder("Key").last();
    const valueInput = page.getByPlaceholder("Value").last();
    await expect(keyInput).toHaveValue("X-Custom");
    await expect(valueInput).toHaveValue("test-value");
  });
});

test.describe("Auth Editor", () => {
  test("shows auth type buttons", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Auth" }).click();
    await expect(page.getByRole("button", { name: "No Auth" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Bearer Token" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Basic Auth" }),
    ).toBeVisible();
  });

  test("shows token input for bearer auth", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Auth" }).click();
    await page.getByText("Bearer Token").click();

    await expect(page.getByPlaceholder("Token")).toBeVisible();
  });
});

test.describe("Body Editor", () => {
  test("shows body type buttons", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Body" }).click();
    await expect(page.getByRole("button", { name: "None" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Raw" })).toBeVisible();
    await expect(page.getByRole("button", { name: "JSON" })).toBeVisible();
  });

  test("shows textarea for raw body", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Body" }).click();
    await page.getByRole("button", { name: "Raw" }).click();

    await expect(page.getByPlaceholder("Request body")).toBeVisible();
  });

  test("shows error for invalid json", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Body" }).click();
    await page.getByRole("button", { name: "JSON" }).click();

    await page.locator("textarea").fill("{ invalid }");
    await expect(page.getByText("Invalid JSON")).toBeVisible();
  });
});

test.describe("Response Panel States", () => {
  test("shows default empty state", async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await expect(
      page.getByText("Send a request to see the response"),
    ).toBeVisible();
  });

  test("shows loading state", async ({ page }) => {
    await page.addInitScript({ content: tauriMockScriptSlow(version) });
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Sending request...")).toBeVisible();
  });

  test("shows success response", async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
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
    await page.addInitScript({ content: tauriMockScript(version) });
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/error");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("timeout")).toBeVisible();
    await expect(page.getByText("Request timed out")).toBeVisible();
  });

  test("shows Body and Headers tabs after response", async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("200")).toBeVisible();
    const responsePanel = page
      .locator("[class*='flex h-full flex-col']")
      .last();
    await expect(
      responsePanel.getByRole("button", { name: "Body" }),
    ).toBeVisible();
    await expect(
      responsePanel.getByRole("button", { name: "Headers" }),
    ).toBeVisible();
  });

  test("switches to Headers tab and shows response headers", async ({
    page,
  }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("200")).toBeVisible();
    const responsePanel = page
      .locator("[class*='flex h-full flex-col']")
      .last();
    await responsePanel.getByRole("button", { name: "Headers" }).click();

    await expect(page.getByText("content-type")).toBeVisible();
    await expect(page.getByText("text/plain")).toBeVisible();
    await expect(page.getByText("x-request-id")).toBeVisible();
  });

  test("shows syntax-highlighted JSON in pretty mode", async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/json");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("200")).toBeVisible();
    await expect(page.getByText("name")).toBeVisible();
    await expect(page.getByText("test")).toBeVisible();
  });

  test("raw/pretty toggle switches display", async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/json");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("200")).toBeVisible();
    const checkbox = page.getByRole("checkbox").last();
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test("shows context-aware empty body message for 204", async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/no-content");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("204", { exact: true })).toBeVisible();
    await expect(
      page.getByText("204 No Content — no body expected"),
    ).toBeVisible();
  });
});

test.describe("URL to Params Sync", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
  });

  test("syncs URL query params to params rows", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Params" }).click();
    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com?page=1&limit=10");

    await expect(
      page.getByRole("textbox", { name: "Key" }).first(),
    ).toHaveValue("page", { timeout: 3000 });
    await expect(
      page.getByRole("textbox", { name: "Value" }).first(),
    ).toHaveValue("1");
    await expect(page.getByRole("textbox", { name: "Key" }).nth(1)).toHaveValue(
      "limit",
    );
    await expect(
      page.getByRole("textbox", { name: "Value" }).nth(1),
    ).toHaveValue("10");
  });
});

test.describe("User-Agent Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({ content: tauriMockScript(version) });
  });

  test("shows locked User-Agent row in headers editor", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Headers" }).click();

    await expect(
      page.getByRole("textbox", { name: "Key" }).first(),
    ).toHaveValue("User-Agent");
    await expect(
      page.getByRole("textbox", { name: "Value" }).first(),
    ).toHaveValue("api-studio/1.1.0");
  });

  test("User-Agent inputs are disabled", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Headers" }).click();

    const keyInput = page.getByRole("textbox", { name: "Key" }).first();
    const valueInput = page.getByRole("textbox", { name: "Value" }).first();
    await expect(keyInput).toBeDisabled();
    await expect(valueInput).toBeDisabled();
  });

  test("can toggle User-Agent enabled state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Headers" }).click();

    const checkboxes = page.locator("input[type='checkbox']");
    const userAgentCheckbox = checkboxes.first();
    await expect(userAgentCheckbox).toBeChecked();

    await userAgentCheckbox.uncheck();
    await expect(userAgentCheckbox).not.toBeChecked();

    await userAgentCheckbox.check();
    await expect(userAgentCheckbox).toBeChecked();
  });

  test("no delete button for User-Agent row", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();

    await page.getByRole("button", { name: "Headers" }).click();

    const headersSection = page
      .locator("div")
      .filter({ hasText: /^User-Agent/ })
      .first();
    const deleteButtons = headersSection
      .locator("button")
      .filter({ hasText: "×" });
    await expect(deleteButtons).toHaveCount(0);
  });
});
