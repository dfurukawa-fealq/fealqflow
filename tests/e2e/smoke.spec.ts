import { expect, test } from '@playwright/test';

test('carrega a página inicial do FealqFlow', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FealqFlow|Portal de Formulários/i);
  await expect(page.locator('body')).toContainText(/FealqFlow|Formulários/i);
});
