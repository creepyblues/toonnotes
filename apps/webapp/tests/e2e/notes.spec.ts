import { test, expect, Page } from '@playwright/test';

// Helper to set up authenticated state
async function mockAuthenticatedUser(page: Page) {
  // Set up mock session cookies
  await page.context().addCookies([
    {
      name: 'sb-auth-token',
      value: 'mock-auth-token',
      domain: 'localhost',
      path: '/',
    },
  ]);

  // Mock Supabase auth response
  await page.route('**/auth/v1/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      }),
    });
  });

  // Mock notes API response
  await page.route('**/rest/v1/notes**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    }
  });

  // Mock labels API response
  await page.route('**/rest/v1/labels**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock designs API response
  await page.route('**/rest/v1/designs**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

test.describe('Notes Page - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should display empty state when no notes exist', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('No notes yet')).toBeVisible();
    await expect(page.getByText('Create your first note to get started')).toBeVisible();
  });

  test.skip('should display New Note button', async ({ page }) => {
    await page.goto('/');

    const newNoteButton = page.getByRole('button', { name: /new note/i });
    await expect(newNoteButton).toBeVisible();
  });

  test.skip('should display view toggle buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: /grid view/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /list view/i })).toBeVisible();
  });

  test.skip('should display search input', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByPlaceholder(/search notes/i)).toBeVisible();
  });
});

test.describe('Note Creation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should navigate to editor when clicking New Note', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /new note/i }).click();

    await expect(page).toHaveURL(/\/notes\/.+/);
  });

  test.skip('should create new note with Cmd+N keyboard shortcut', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Meta+n');

    await expect(page).toHaveURL(/\/notes\/.+/);
  });
});

test.describe('Note Editor', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should display back button', async ({ page }) => {
    await page.goto('/notes/test-note-id');

    await expect(page.getByRole('button', { name: /go back/i })).toBeVisible();
  });

  test.skip('should display title input', async ({ page }) => {
    await page.goto('/notes/test-note-id');

    await expect(page.getByPlaceholder('Untitled')).toBeVisible();
  });

  test.skip('should display formatting toolbar', async ({ page }) => {
    await page.goto('/notes/test-note-id');

    // Check for formatting buttons
    await expect(page.getByRole('button', { name: /bold/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /italic/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /underline/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /strikethrough/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /bullet list/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /checklist/i })).toBeVisible();
  });

  test.skip('should display action buttons', async ({ page }) => {
    await page.goto('/notes/test-note-id');

    await expect(page.getByRole('button', { name: /pin/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /archive/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
  });

  test.skip('should display color picker button', async ({ page }) => {
    await page.goto('/notes/test-note-id');

    await expect(page.getByRole('button', { name: /change color/i })).toBeVisible();
  });
});

test.describe('View Modes', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should switch to list view', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /list view/i }).click();

    // The list view button should be active
    const listButton = page.getByRole('button', { name: /list view/i });
    await expect(listButton).toHaveClass(/text-purple/);
  });

  test.skip('should switch to grid view', async ({ page }) => {
    await page.goto('/');

    // First switch to list
    await page.getByRole('button', { name: /list view/i }).click();
    // Then back to grid
    await page.getByRole('button', { name: /grid view/i }).click();

    // The grid view button should be active
    const gridButton = page.getByRole('button', { name: /grid view/i });
    await expect(gridButton).toHaveClass(/text-purple/);
  });
});

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page);
  });

  test.skip('should filter notes as user types', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/search notes/i);
    await searchInput.fill('test query');

    // Wait for the debounced search to complete
    await page.waitForTimeout(500);

    // The search query should be in the input
    await expect(searchInput).toHaveValue('test query');
  });

  test.skip('should show no results message when search has no matches', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/search notes/i);
    await searchInput.fill('nonexistent query');

    await expect(page.getByText('No notes found')).toBeVisible();
    await expect(page.getByText('Try a different search term')).toBeVisible();
  });
});
