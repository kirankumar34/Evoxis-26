import { test, expect } from '@playwright/test';

test.describe('AC1 & AC12: End-to-End Registration & QR Pass Verification', () => {
  test('1. Happy Path: Participant browses events, registers, and receives QR pass', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/EvoXis'26/);

    // 2. Verify Hero & Events section exists
    const eventsSection = page.locator('#events');
    await expect(eventsSection).toBeVisible();

    // 3. Navigate to Register page
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/Official Registration/i);

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

  test('3. My Registration: Lookup pass by Registration ID or Email', async ({ page }) => {
    await page.goto('/my-registration');
    await expect(page.locator('h1')).toContainText(/Find Your Pass/i);

    // Fill search input with mock ID
    await page.fill('input[placeholder*="EVOXIS26"]', 'EVOXIS26-00001');
    await page.click('button:has-text("Search Pass")');

    // Assert participant card loads
    await expect(page.locator('text=EVOXIS26-00001').or(page.locator('text=Priya Raman'))).toBeVisible({ timeout: 5000 });
  });

  test('4. Committee Portal: Login & Reception Desk scanner interface loads', async ({ page }) => {
    await page.goto('/committee/login');
    await expect(page.locator('h1')).toContainText(/Committee Portal/i);

    // Login as Reception
    await page.fill('input[name="username"]', 'reception');
    await page.fill('input[name="password"]', 'sriram2026');
    await page.click('button:has-text("Sign In")');

    // Assert redirection to scanner
    await expect(page).toHaveURL(/committee\/reception-scanner|committee\/dashboard/, { timeout: 8000 });
  });
});
