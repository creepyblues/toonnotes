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

// Board Styling Tests
test.describe('Board Styling', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should display board cards with preset colors', async ({ page }) => {
    await page.goto('/boards');
    await page.waitForLoadState('networkidle');

    // Board cards should have gradient backgrounds
    const workBoard = page.locator('article').filter({ hasText: 'work' });
    await expect(workBoard).toBeVisible();

    // The preview area should have a gradient background (from preset)
    const previewArea = workBoard.locator('.aspect-\\[4\\/3\\]');
    await expect(previewArea).toHaveCSS('background', /linear-gradient/);
  });

  test.skip('should display preset badge on board cards', async ({ page }) => {
    await page.goto('/boards');
    await page.waitForLoadState('networkidle');

    // Should see preset name badges
    const workBoard = page.locator('article').filter({ hasText: 'work' });
    // Work hashtag should auto-match to a preset or show auto-generated name
    await expect(workBoard.locator('span').filter({ hasText: /\w+/ })).toBeVisible();
  });

  test.skip('should display styled header on board detail page', async ({ page }) => {
    await page.goto('/boards/work');
    await page.waitForLoadState('networkidle');

    // Header should have gradient background
    const header = page.locator('header').first();
    await expect(header).toHaveCSS('background', /linear-gradient/);
  });

  test.skip('should display style picker button on board detail page', async ({ page }) => {
    await page.goto('/boards/work');
    await page.waitForLoadState('networkidle');

    // Should see the style picker button (Palette icon)
    await expect(page.getByLabel('Change board style')).toBeVisible();
  });

  test.skip('should open style picker modal when clicking style button', async ({ page }) => {
    await page.goto('/boards/work');
    await page.waitForLoadState('networkidle');

    // Click the style picker button
    await page.getByLabel('Change board style').click();

    // Modal should appear
    await expect(page.getByText('Board Style')).toBeVisible();
    await expect(page.getByText(/choose a style for #work/i)).toBeVisible();
  });

  test.skip('should display category tabs in style picker', async ({ page }) => {
    await page.goto('/boards/work');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Change board style').click();

    // Should see category tabs
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Productivity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reading' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Creative' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Content' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Personal' })).toBeVisible();
  });

  test.skip('should display preset cards in style picker', async ({ page }) => {
    await page.goto('/boards/work');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Change board style').click();

    // Should see preset cards (at least the first few)
    await expect(page.getByText('Todo')).toBeVisible();
    await expect(page.getByText('Important')).toBeVisible();
    await expect(page.getByText('Reading')).toBeVisible();
  });

  test.skip('should close style picker when clicking outside', async ({ page }) => {
    await page.goto('/boards/work');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Change board style').click();
    await expect(page.getByText('Board Style')).toBeVisible();

    // Click the backdrop
    await page.locator('.fixed.inset-0.bg-black\\/50').click({ position: { x: 10, y: 10 } });

    // Modal should close
    await expect(page.getByText('Board Style')).not.toBeVisible();
  });

  test.skip('should close style picker when clicking close button', async ({ page }) => {
    await page.goto('/boards/work');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Change board style').click();
    await expect(page.getByText('Board Style')).toBeVisible();

    // Click close button
    await page.getByLabel('Close').click();

    // Modal should close
    await expect(page.getByText('Board Style')).not.toBeVisible();
  });

  test.skip('should filter presets by category', async ({ page }) => {
    await page.goto('/boards/work');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Change board style').click();

    // Click Productivity category
    await page.getByRole('button', { name: 'Productivity' }).click();

    // Should see productivity presets
    await expect(page.getByText('Todo')).toBeVisible();
    await expect(page.getByText('Important')).toBeVisible();
    await expect(page.getByText('Goals')).toBeVisible();

    // Should NOT see non-productivity presets
    await expect(page.getByText('Reading')).not.toBeVisible();
  });

  test.skip('should show decorations on board cards', async ({ page }) => {
    await page.goto('/boards');
    await page.waitForLoadState('networkidle');

    // Boards with presets that have decorations should show emoji decorations
    // This depends on which hashtags match which presets
    const boardCard = page.locator('article').first();
    await expect(boardCard).toBeVisible();
  });

  test.skip('should display preset name in board detail header', async ({ page }) => {
    await page.goto('/boards/work');
    await page.waitForLoadState('networkidle');

    // Should see the preset name in the header subtitle
    // The preset name depends on the auto-matching logic
    const header = page.locator('header').first();
    await expect(header.getByText(/\d+ notes? · \w+/)).toBeVisible();
  });
});
