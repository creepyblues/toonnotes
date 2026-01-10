import { test, expect, Page } from '@playwright/test';

async function mockAuthenticatedUser(page: Page, options: { archived?: number; deleted?: number } = {}) {
  const { archived = 2, deleted = 3 } = options;

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

  const notes = [
    // Active notes
    {
      id: 'active-1',
      title: 'Active Note',
      content: 'Active content',
      labels: [],
      color: '#FFFFFF',
      is_pinned: false,
      is_archived: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    // Archived notes
    ...Array.from({ length: archived }, (_, i) => ({
      id: `archived-${i + 1}`,
      title: `Archived Note ${i + 1}`,
      content: `Archived content ${i + 1}`,
      labels: [],
      color: '#EDE9FE',
      is_pinned: false,
      is_archived: true,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    // Deleted notes
    ...Array.from({ length: deleted }, (_, i) => ({
      id: `deleted-${i + 1}`,
      title: `Deleted Note ${i + 1}`,
      content: `Deleted content ${i + 1}`,
      labels: [],
      color: '#FFE4E6',
      is_pinned: false,
      is_archived: false,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  ];

  await page.route('**/rest/v1/notes**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(notes),
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

test.describe('Archive Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page, { archived: 2, deleted: 0 });
  });

  test.skip('should display Archive header', async ({ page }) => {
    await page.goto('/archive');

    await expect(page.getByRole('heading', { name: /archive/i, level: 1 })).toBeVisible();
  });

  test.skip('should display archived notes', async ({ page }) => {
    await page.goto('/archive');

    await expect(page.getByText('Archived Note 1')).toBeVisible();
    await expect(page.getByText('Archived Note 2')).toBeVisible();
  });

  test.skip('should not display active notes', async ({ page }) => {
    await page.goto('/archive');

    await expect(page.getByText('Active Note')).not.toBeVisible();
  });

  test.skip('should display archive icon on note cards', async ({ page }) => {
    await page.goto('/archive');

    // Each archived note should have an archive icon
    const archiveIcons = page.locator('article svg[data-icon="archive"]');
    await expect(archiveIcons).toHaveCount(2);
  });

  test.skip('should navigate to note editor when clicking archived note', async ({ page }) => {
    await page.goto('/archive');

    await page.getByText('Archived Note 1').click();

    await expect(page).toHaveURL(/\/notes\/archived-1/);
  });
});

test.describe('Empty Archive State', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page, { archived: 0, deleted: 0 });
  });

  test.skip('should display empty state', async ({ page }) => {
    await page.goto('/archive');

    await expect(page.getByText('No archived notes')).toBeVisible();
  });
});

test.describe('Trash Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page, { archived: 0, deleted: 3 });
  });

  test.skip('should display Trash header', async ({ page }) => {
    await page.goto('/trash');

    await expect(page.getByRole('heading', { name: /trash/i, level: 1 })).toBeVisible();
  });

  test.skip('should display deleted notes', async ({ page }) => {
    await page.goto('/trash');

    await expect(page.getByText('Deleted Note 1')).toBeVisible();
    await expect(page.getByText('Deleted Note 2')).toBeVisible();
    await expect(page.getByText('Deleted Note 3')).toBeVisible();
  });

  test.skip('should not display active notes', async ({ page }) => {
    await page.goto('/trash');

    await expect(page.getByText('Active Note')).not.toBeVisible();
  });

  test.skip('should display trash icon on note cards', async ({ page }) => {
    await page.goto('/trash');

    // Each deleted note should have a trash icon
    const trashIcons = page.locator('article svg[data-icon="trash"]');
    await expect(trashIcons).toHaveCount(3);
  });

  test.skip('should navigate to note editor when clicking deleted note', async ({ page }) => {
    await page.goto('/trash');

    await page.getByText('Deleted Note 1').click();

    await expect(page).toHaveURL(/\/notes\/deleted-1/);
  });
});

test.describe('Empty Trash State', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page, { archived: 0, deleted: 0 });
  });

  test.skip('should display empty state', async ({ page }) => {
    await page.goto('/trash');

    await expect(page.getByText('Trash is empty')).toBeVisible();
  });
});

test.describe('Sidebar Badges', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page, { archived: 5, deleted: 10 });
  });

  test.skip('should display archive count badge', async ({ page }) => {
    await page.goto('/');

    const archiveLink = page.getByRole('link', { name: /archive/i });
    await expect(archiveLink.getByText('5')).toBeVisible();
  });

  test.skip('should display trash count badge', async ({ page }) => {
    await page.goto('/');

    // The trash badge shows 9+ for counts over 9 when sidebar is collapsed
    const trashLink = page.getByRole('link', { name: /trash/i });
    await expect(trashLink.getByText('10')).toBeVisible();
  });
});
