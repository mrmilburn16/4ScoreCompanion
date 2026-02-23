import path from "node:path";

import { expect, test } from "@playwright/test";

test("uploads and lists a PDF", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /upload scores fast/i })).toBeVisible();

  const fixturePath = path.resolve(__dirname, "../fixtures/sample.pdf");
  await page.locator('input[type="file"]').first().setInputFiles(fixturePath);
  await expect(page.getByText(/added 1 file to queue/i)).toBeVisible();
  await page.getByRole("button", { name: /upload queued files/i }).click();

  await expect(page.getByText(/uploaded 1 file/i)).toBeVisible();
  const fileCell = page.getByRole("cell", { name: /sample\.pdf/i }).first();
  await expect(fileCell).toBeVisible();

  const firstDataRow = page.locator("tbody tr").first();
  const downloadPromise = page.waitForEvent("download");
  await firstDataRow.getByRole("button", { name: "Download" }).click();
  await downloadPromise;
  await expect(page.getByText(/downloaded "sample\.pdf"/i)).toBeVisible();

  await firstDataRow.getByRole("button", { name: "Share" }).click();
  await expect(page.getByText(/share is unavailable|cannot share/i)).toBeVisible();

  await firstDataRow.getByRole("button", { name: "Copy Link" }).click();
  await expect(page.getByText(/download link copied/i)).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await firstDataRow.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText(/removed "sample\.pdf"/i)).toBeVisible();
});

test("exercises checklist modal and key controls", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /how to import into forscore/i }).click();
  const guideDialog = page.locator('[role="dialog"][aria-hidden="false"]');
  await expect(guideDialog.getByRole("heading", { name: /send to forscore/i })).toBeVisible();
  await guideDialog.getByRole("button", { name: "Got it" }).click();
  await expect(page.locator('[role="dialog"][aria-hidden="false"]')).toHaveCount(0);

  await page.getByRole("button", { name: /open import checklist/i }).click();
  const secondGuideDialog = page.locator('[role="dialog"][aria-hidden="false"]');
  await expect(secondGuideDialog.getByRole("heading", { name: /send to forscore/i })).toBeVisible();
  await secondGuideDialog.getByRole("button", { name: "Got it" }).click();

  const browseChooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /browse device/i }).click();
  await browseChooser;

  const chooseChooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /^choose files$/i }).click();
  await chooseChooser;

  await page.getByRole("button", { name: /refresh/i }).click();

  await page.getByLabel("Search files").fill("sample");
  await page.getByLabel("Type").selectOption("pdf");
  await page.getByLabel("Sort").selectOption("name");
});

test("shows validation error for unsupported file types", async ({ page }) => {
  await page.goto("/");

  const fixturePath = path.resolve(__dirname, "../fixtures/bad.txt");
  await page.locator('input[type="file"]').first().setInputFiles(fixturePath);
  await expect(page.getByText(/added 1 file to queue/i)).toBeVisible();

  await page.getByRole("button", { name: /upload queued files/i }).click();
  await expect(page.getByText(/unsupported format for "bad\.txt"/i)).toBeVisible();
  await expect(page.getByText("Failed", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /retry failed/i }).click();
  await expect(page.getByText("Queued", { exact: true })).toBeVisible();
});

test("cancels an in-flight upload", async ({ page }) => {
  await page.goto("/");

  const delayedRoute = async (route: Parameters<Parameters<typeof page.route>[1]>[0]) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.continue();
  };
  await page.route("**/api/files/upload", delayedRoute);

  const fixturePath = path.resolve(__dirname, "../fixtures/sample.pdf");
  await page.locator('input[type="file"]').first().setInputFiles(fixturePath);
  await expect(page.getByText(/added 1 file to queue/i)).toBeVisible();

  await page.getByRole("button", { name: /upload queued files/i }).click();
  await expect(page.getByRole("button", { name: /cancel upload/i })).toBeEnabled();
  await page.getByRole("button", { name: /cancel upload/i }).click();

  await expect(page.getByRole("status").filter({ hasText: /upload cancelled/i })).toBeVisible();
  await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /cancel upload/i })).toBeDisabled();

  await page.unroute("**/api/files/upload", delayedRoute);
});

test("supports queue remove and clear-completed controls", async ({ page }) => {
  await page.goto("/");

  const fixturePath = path.resolve(__dirname, "../fixtures/sample.pdf");

  await page.locator('input[type="file"]').first().setInputFiles(fixturePath);
  await expect(page.getByRole("heading", { name: /upload queue/i })).toBeVisible();

  const queueSection = page.locator("section", {
    has: page.getByRole("heading", { name: /upload queue/i }),
  });
  await expect(queueSection.getByRole("button", { name: /cancel upload/i })).toBeDisabled();
  await queueSection.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("heading", { name: /upload queue/i })).toHaveCount(0);

  await page.locator('input[type="file"]').first().setInputFiles(fixturePath);
  await page.getByRole("button", { name: /upload queued files/i }).click();
  await expect(page.getByText(/uploaded 1 file/i)).toBeVisible();

  const queueSectionAfterUpload = page.locator("section", {
    has: page.getByRole("heading", { name: /upload queue/i }),
  });
  const clearCompletedButton = queueSectionAfterUpload.getByRole("button", {
    name: /clear completed/i,
  });
  await expect(clearCompletedButton).toBeEnabled();
  await clearCompletedButton.click();
  await expect(page.getByRole("heading", { name: /upload queue/i })).toHaveCount(0);
});

test.describe("mobile viewport sanity", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("renders uploader and mobile cards on small screens", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /upload scores fast/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^choose files$/i })).toBeVisible();

    const fixturePath = path.resolve(__dirname, "../fixtures/sample.pdf");
    await page.locator('input[type="file"]').first().setInputFiles(fixturePath);
    await page.getByRole("button", { name: /upload queued files/i }).click();
    await expect(page.getByText(/uploaded 1 file/i)).toBeVisible();

    // On mobile widths we render card-style rows instead of desktop table.
    await expect(page.getByRole("button", { name: "Remove" }).first()).toBeVisible();
    await expect(page.getByText(/sample\.pdf/i).first()).toBeVisible();
  });
});
