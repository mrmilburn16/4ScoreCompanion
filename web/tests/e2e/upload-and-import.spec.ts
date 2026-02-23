import path from "node:path";

import { expect, test } from "@playwright/test";

test("uploads and lists a PDF", async ({ page }) => {
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

  page.once("dialog", (dialog) => dialog.accept());
  await firstDataRow.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText(/removed "sample\.pdf"/i)).toBeVisible();
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
