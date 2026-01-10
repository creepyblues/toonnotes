import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login page for unauthenticated users', async ({ page }) => {
      await page.goto('/');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);

      // Should display ToonNotes branding
      await expect(page.getByText('ToonNotes')).toBeVisible();
      await expect(page.getByText('Sign in to access your notes')).toBeVisible();
    });

    test('should display Google login button', async ({ page }) => {
      await page.goto('/auth/login');

      const googleButton = page.getByRole('button', { name: /continue with google/i });
      await expect(googleButton).toBeVisible();
    });

    test('should display Apple login button', async ({ page }) => {
      await page.goto('/auth/login');

      const appleButton = page.getByRole('button', { name: /continue with apple/i });
      await expect(appleButton).toBeVisible();
    });

    test('should display error message when auth fails', async ({ page }) => {
      await page.goto('/auth/login?error=auth_failed');

      await expect(page.getByText(/an error occurred during sign in/i)).toBeVisible();
    });

    test('should display unauthorized message', async ({ page }) => {
      await page.goto('/auth/login?error=unauthorized');

      await expect(page.getByText(/you are not authorized/i)).toBeVisible();
    });

    test('should display terms of service notice', async ({ page }) => {
      await page.goto('/auth/login');

      await expect(page.getByText(/terms of service/i)).toBeVisible();
      await expect(page.getByText(/privacy policy/i)).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing notes page', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login when accessing archive page', async ({ page }) => {
      await page.goto('/archive');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login when accessing trash page', async ({ page }) => {
      await page.goto('/trash');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login when accessing settings page', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login when accessing boards page', async ({ page }) => {
      await page.goto('/boards');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login when accessing designs page', async ({ page }) => {
      await page.goto('/designs');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login when accessing individual note', async ({ page }) => {
      await page.goto('/notes/some-note-id');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
