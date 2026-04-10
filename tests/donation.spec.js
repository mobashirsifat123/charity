import { test, expect } from '@playwright/test';

test('has donation modal and works properly', async ({ page }) => {
  await page.goto('/');

  // Look for the Donate button in the header or layout
  const donateButton = page.locator('text=Donate Now').first();
  await expect(donateButton).toBeVisible();

  // Click standard flow to verify UI is responsive
  await donateButton.click();
  
  // A modal or new page should be visible
  await expect(page.locator('.modal-content, form')).toBeVisible({ timeout: 10000 });
});
