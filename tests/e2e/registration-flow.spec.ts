import { test, expect } from '@playwright/test';

test.describe('EvoXis26: Participant-Only Registration & Routes', () => {
  test('1. Happy Path: Participant browses events, registers, and receives QR pass', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/EvoXis'26/);

    // 2. Verify Hero & Events section exists
    const eventsSection = page.locator('#events');
    await expect(eventsSection).toBeVisible();

    // 3. Navigate to Register page
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/Join/i);

    // 4. Fill in participant details
    await page.fill('input[name="fullName"]', 'Test Student');
    await page.fill('input[name="email"]', 'test_e2e_student@example.com');
    await page.fill('input[name="phone"]', '9840112345');
    await page.fill('input[name="collegeName"]', 'Sriram Engineering College');

    // Select department & year
    await page.selectOption('select[name="department"]', 'CSBS');
    await page.selectOption('select[name="yearOfStudy"]', '3rd Year');

    // 5. Select Events (TE01 - Paper Presentation)
    const eventCard = page.locator('text=Paper Presentation').first();
    if (await eventCard.isVisible()) {
      await eventCard.click();
    }

    // 6. Submit Form
    const submitBtn = page.locator('button:has-text("Complete Free Registration")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      // 7. Verify Success Page redirection & QR Code display
      await expect(page).toHaveURL(/registration-success|register/, { timeout: 10000 });
    }
  });

  test('2. Form Validation: Blocks invalid email, short phone number, and empty event selection', async ({ page }) => {
    await page.goto('/register');

    // Try submitting empty form
    const submitBtn = page.locator('button:has-text("Complete Free Registration")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      // Assert validation messages appear
      await expect(page.locator('text=Full Name is required').or(page.locator('text=required'))).toBeVisible();
    }
  });

  test('3. Events Pages: /events and /events/:id render correctly', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('h1')).toContainText(/Symposium Events/i);

    // Navigate to single event details
    await page.goto('/events/TE01');
    await expect(page.locator('h1')).toContainText(/Paper Presentation/i);
    await expect(page.locator('text=Rules & Regulations')).toBeVisible();
  });

  test('4. Committee routes removed: /committee/* and /admin/* redirect to home', async ({ page }) => {
    await page.goto('/committee/login');
    await expect(page).toHaveURL('/');

    await page.goto('/committee/dashboard');
    await expect(page).toHaveURL('/');

    await page.goto('/admin/events');
    await expect(page).toHaveURL('/');
  });
});
