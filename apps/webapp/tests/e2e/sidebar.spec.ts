import { test, expect, Page } from '@playwright/test';

// Helper to set up authenticated state
async function mockAuthenticatedUser(page: Page) {
  await page.route('**/auth/v1/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
      }),
    });
  });

  await page.route('**/rest/v1/notes**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'note-1',
            title: 'Test Note',
            content: 'Test content',
            labels: [],
            color: '#FFFFFF',
            is_pinned: false,
            is_archived: false,
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]),
      });
    } else {
      await route.fulfill({ status: 200 });
    }
  });

  await page.route('**/rest/v1/labels**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/rest/v1/designs**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should display ToonNotes logo', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('ToonNotes')).toBeVisible();
  });

  test.skip('should display main navigation items', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /notes/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /boards/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /designs/i })).toBeVisible();
  });

  test.skip('should display secondary navigation items', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /archive/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /trash/i })).toBeVisible();
  });

  test.skip('should display settings link', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();
  });

  test.skip('should display sign out button', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test.skip('should navigate to notes page', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('link', { name: /notes/i }).click();

    await expect(page).toHaveURL('/');
  });

  test.skip('should navigate to boards page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /boards/i }).click();

    await expect(page).toHaveURL('/boards');
  });

  test.skip('should navigate to designs page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /designs/i }).click();

    await expect(page).toHaveURL('/designs');
  });

  test.skip('should navigate to archive page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /archive/i }).click();

    await expect(page).toHaveURL('/archive');
  });

  test.skip('should navigate to trash page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /trash/i }).click();

    await expect(page).toHaveURL('/trash');
  });

  test.skip('should navigate to settings page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /settings/i }).click();

    await expect(page).toHaveURL('/settings');
  });
});

test.describe('Sidebar Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should collapse sidebar when clicking toggle button', async ({ page }) => {
    await page.goto('/');

    // Find and click the collapse button
    await page.getByRole('button', { name: /collapse sidebar/i }).click();

    // The sidebar should be narrower
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/w-16/);
  });

  test.skip('should expand sidebar when clicking toggle button', async ({ page }) => {
    await page.goto('/');

    // First collapse
    await page.getByRole('button', { name: /collapse sidebar/i }).click();

    // Then expand
    await page.getByRole('button', { name: /expand sidebar/i }).click();

    // The sidebar should be wider
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/w-60/);
  });

  test.skip('should hide navigation labels when collapsed', async ({ page }) => {
    await page.goto('/');

    // Collapse the sidebar
    await page.getByRole('button', { name: /collapse sidebar/i }).click();

    // The text labels should be hidden
    const notesText = page.locator('aside').getByText('Notes');
    await expect(notesText).not.toBeVisible();
  });

  test.skip('should persist sidebar state across navigation', async ({ page }) => {
    await page.goto('/');

    // Collapse the sidebar
    await page.getByRole('button', { name: /collapse sidebar/i }).click();

    // Navigate to another page
    await page.goto('/settings');

    // The sidebar should still be collapsed
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/w-16/);
  });
});
