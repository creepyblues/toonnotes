import { test, expect, Page } from '@playwright/test';

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
            id: 'archived-1',
            title: 'Archived Note',
            content: 'content',
            labels: [],
            color: '#FFFFFF',
            is_pinned: false,
            is_archived: true,
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'deleted-1',
            title: 'Deleted Note 1',
            content: 'content',
            labels: [],
            color: '#FFFFFF',
            is_pinned: false,
            is_archived: false,
            is_deleted: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'deleted-2',
            title: 'Deleted Note 2',
            content: 'content',
            labels: [],
            color: '#FFFFFF',
            is_pinned: false,
            is_archived: false,
            is_deleted: true,
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

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should display Settings header', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: /settings/i, level: 1 })).toBeVisible();
  });

  test.skip('should display Appearance section', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: /appearance/i })).toBeVisible();
  });

  test.skip('should display dark mode toggle', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByText('Dark Mode')).toBeVisible();
    await expect(page.getByRole('switch')).toBeVisible();
  });

  test.skip('should toggle dark mode', async ({ page }) => {
    await page.goto('/settings');

    const toggle = page.getByRole('switch');

    // Initially light mode
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Click to enable dark mode
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Click again to disable
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test.skip('should display Data section', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: /data/i })).toBeVisible();
  });

  test.skip('should display archived notes count', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByText('Archived Notes')).toBeVisible();
    await expect(page.getByText('1 note archived')).toBeVisible();
  });

  test.skip('should display trash count', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByText('Trash')).toBeVisible();
    await expect(page.getByText('2 notes in trash')).toBeVisible();
  });

  test.skip('should navigate to archive when clicking archived notes', async ({ page }) => {
    await page.goto('/settings');

    await page.getByRole('link', { name: /archived notes/i }).click();

    await expect(page).toHaveURL('/archive');
  });

  test.skip('should navigate to trash when clicking trash', async ({ page }) => {
    await page.goto('/settings');

    await page.getByRole('link', { name: /^trash$/i }).click();

    await expect(page).toHaveURL('/trash');
  });

  test.skip('should display Account section', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: /account/i })).toBeVisible();
  });

  test.skip('should display sign out button in account section', async ({ page }) => {
    await page.goto('/settings');

    const signOutButton = page.locator('section').filter({ hasText: 'Account' }).getByText('Sign Out');
    await expect(signOutButton).toBeVisible();
  });

  test.skip('should display footer', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByText('ToonNotes Web App')).toBeVisible();
    await expect(page.getByText(/made with love/i)).toBeVisible();
  });
});

test.describe('Dark Mode Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should persist dark mode setting', async ({ page }) => {
    await page.goto('/settings');

    // Enable dark mode
    const toggle = page.getByRole('switch');
    await toggle.click();

    // Navigate away
    await page.goto('/');

    // Navigate back
    await page.goto('/settings');

    // Dark mode should still be enabled
    await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  test.skip('should apply dark mode to entire app', async ({ page }) => {
    await page.goto('/settings');

    // Enable dark mode
    await page.getByRole('switch').click();

    // Check that dark mode class is applied
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
