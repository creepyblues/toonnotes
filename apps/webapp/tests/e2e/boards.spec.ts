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
            id: 'note-1',
            title: 'Work Task 1',
            content: 'Important work task',
            labels: ['work', 'important'],
            color: '#FFFFFF',
            is_pinned: false,
            is_archived: false,
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'note-2',
            title: 'Work Task 2',
            content: 'Another work task',
            labels: ['work'],
            color: '#EDE9FE',
            is_pinned: false,
            is_archived: false,
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'note-3',
            title: 'Personal Note',
            content: 'My personal note',
            labels: ['personal'],
            color: '#FFE4E6',
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
      body: JSON.stringify([
        { id: 'label-1', name: 'work', created_at: new Date().toISOString() },
        { id: 'label-2', name: 'important', created_at: new Date().toISOString() },
        { id: 'label-3', name: 'personal', created_at: new Date().toISOString() },
      ]),
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

test.describe('Boards Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should display Boards header', async ({ page }) => {
    await page.goto('/boards');

    await expect(page.getByRole('heading', { name: /boards/i, level: 1 })).toBeVisible();
  });

  test.skip('should display board cards for each unique label', async ({ page }) => {
    await page.goto('/boards');

    // Should have 3 unique labels as boards: work, important, personal
    await expect(page.getByText('#work')).toBeVisible();
    await expect(page.getByText('#important')).toBeVisible();
    await expect(page.getByText('#personal')).toBeVisible();
  });

  test.skip('should display note count on board cards', async ({ page }) => {
    await page.goto('/boards');

    // Work board should show 2 notes
    const workBoard = page.locator('article').filter({ hasText: '#work' });
    await expect(workBoard.getByText('2 notes')).toBeVisible();

    // Personal board should show 1 note
    const personalBoard = page.locator('article').filter({ hasText: '#personal' });
    await expect(personalBoard.getByText('1 note')).toBeVisible();
  });

  test.skip('should navigate to board detail when clicking a board', async ({ page }) => {
    await page.goto('/boards');

    await page.getByText('#work').click();

    await expect(page).toHaveURL(/\/boards\/work/);
  });
});

test.describe('Board Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should display board hashtag as title', async ({ page }) => {
    await page.goto('/boards/work');

    await expect(page.getByRole('heading', { name: /work/i })).toBeVisible();
    await expect(page.locator('svg').filter({ has: page.locator('[data-icon="hash"]') })).toBeVisible();
  });

  test.skip('should display back button', async ({ page }) => {
    await page.goto('/boards/work');

    await expect(page.getByRole('link', { name: /back to boards/i })).toBeVisible();
  });

  test.skip('should navigate back to boards when clicking back button', async ({ page }) => {
    await page.goto('/boards/work');

    await page.getByRole('link', { name: /back to boards/i }).click();

    await expect(page).toHaveURL('/boards');
  });

  test.skip('should display note count', async ({ page }) => {
    await page.goto('/boards/work');

    await expect(page.getByText('2 notes')).toBeVisible();
  });

  test.skip('should display notes with matching label', async ({ page }) => {
    await page.goto('/boards/work');

    await expect(page.getByText('Work Task 1')).toBeVisible();
    await expect(page.getByText('Work Task 2')).toBeVisible();
  });

  test.skip('should navigate to note editor when clicking a note', async ({ page }) => {
    await page.goto('/boards/work');

    await page.getByText('Work Task 1').click();

    await expect(page).toHaveURL(/\/notes\/note-1/);
  });

  test.skip('should handle URL-encoded hashtags', async ({ page }) => {
    // Test with spaces in hashtag
    await page.goto('/boards/' + encodeURIComponent('my tag'));

    await expect(page.getByRole('heading', { name: /my tag/i })).toBeVisible();
  });
});

test.describe('Empty Boards State', () => {
  test.beforeEach(async ({ page }) => {
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

    // No notes = no boards
    await page.route('**/rest/v1/notes**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
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
  });

  test.skip('should display empty state message', async ({ page }) => {
    await page.goto('/boards');

    await expect(page.getByText('No boards yet')).toBeVisible();
    await expect(page.getByText(/boards are automatically created from labels/i)).toBeVisible();
    await expect(page.getByText(/#hashtags/i)).toBeVisible();
  });
});

test.describe('Empty Board Detail State', () => {
  test.beforeEach(async ({ page }) => {
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
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
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
  });

  test.skip('should display empty state for board with no notes', async ({ page }) => {
    await page.goto('/boards/empty-board');

    await expect(page.getByText('No notes in this board')).toBeVisible();
    await expect(page.getByText(/add #empty-board to your notes/i)).toBeVisible();
  });
});
