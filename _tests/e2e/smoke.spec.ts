import { test, expect } from '@playwright/test';

test('landing page loads and has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FinFlow/);
  await expect(page.getByText('The money app built for teens')).toBeVisible();
});

test('navigation to auth page works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started' }).click();
  await expect(page).toHaveURL(/\/auth/);
});

test('auth page has login and signup forms', async ({ page }) => {
  await page.goto('/auth');
  await expect(page.getByPlaceholder('teen@example.com')).toBeVisible();
  await expect(page.getByPlaceholder('••••••••')).toBeVisible();
});
