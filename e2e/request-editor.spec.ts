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
    await expect(page.getByText("GET Untitled")).toBeVisible();
  });

  test("shows request in sidebar after creation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await page
      .getByPlaceholder("Enter request URL")
      .fill("https://api.example.com/users");
    await expect(page.getByText("GET /users")).toBeVisible();
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
    await sidebar.getByText("GET /users").click();
    const input = page.getByPlaceholder("Enter request URL");
    await expect(input).toHaveValue("https://api.example.com/users");
  });

  test("deletes request from sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "New Request" }).click();
    await expect(page.getByText("GET Untitled")).toBeVisible();

    const requestItem = page.locator("li").filter({ hasText: "GET Untitled" });
    await requestItem.hover();
    await requestItem.getByTitle("Delete request").click({ force: true });

    await expect(page.getByText("GET Untitled")).not.toBeVisible();
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

    await page.getByPlaceholder("Key").fill("X-Custom");
    await page.getByPlaceholder("Value").fill("test-value");

    const keyInput = page.getByPlaceholder("Key");
    const valueInput = page.getByPlaceholder("Value");
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
});
