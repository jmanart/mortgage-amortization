import { test, expect, type Page } from '@playwright/test';

/**
 * Category 4: Early Repayment & Amortization Strategies
 * Tests covering early repayment scenarios and their impact on the mortgage
 */

test.describe('Category 4: Early Repayment & Amortization Strategies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 4.1: One-Time Windfall Payment', async ({ page }) => {
    // Create base simulation
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(1000);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Base Scenario');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Navigate to amortization page
    await page.goto('/amortization');
    await page.waitForLoadState('networkidle');

    // Add one-off payment of 10k at month 60 (year 5)
    await page.click('#add-amortization-btn');
    await page.waitForTimeout(500);

    // Fill in the one-off payment details
    const paymentItem = page.locator('.amortization-payment-item').last();
    const amountInput = paymentItem.locator('input[type="number"]').first();
    const periodInput = paymentItem.locator('input[type="number"]').nth(1);

    await amountInput.fill('10000');
    await periodInput.fill('60'); // Month 60 = Year 5

    await page.waitForTimeout(1000);

    // Save as "Bank A - With Bonus"
    const amortTitleInput = page.locator('#simulation-title-input');
    await amortTitleInput.click();
    await amortTitleInput.fill('Bank A - With Bonus');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Verify summary shows impact
    const summaryContainer = page.locator('#summary-container');
    await expect(summaryContainer).not.toContainText('Add amortization payments');
  });

  test('Scenario 4.2: Regular Extra Payments', async ({ page }) => {
    // Navigate to amortization page
    await page.goto('/amortization');
    await page.waitForLoadState('networkidle');

    // Add periodic payments (500 every 6 months, starting month 12)
    await page.fill('#periodic-amount', '500');
    await page.fill('#periodic-interval', '6');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '300');

    // Click add periodic payment
    await page.click('#add-periodic-payment-btn');
    await page.waitForTimeout(500);

    // Verify periodic payment added
    const periodicList = page.locator('#periodic-payments-list');
    await expect(periodicList).toContainText('500');
    await expect(periodicList).toContainText('6');

    // Save simulation
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Regular Extra Payments');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Verify simulation saved with periodic payments
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations).toHaveLength(1);
    expect(simulations[0].periodicPayments).toBeDefined();
  });

  test('Scenario 4.3: Penalty Comparison', async ({ page }) => {
    // Create Bank K offer with 0% penalty
    await page.goto('/amortization');
    await page.waitForLoadState('networkidle');

    // Add periodic payment with 0% penalty
    await page.fill('#periodic-amount', '1000');
    await page.fill('#periodic-interval', '12');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '120');
    await page.fill('#periodic-penalty', '0');

    await page.click('#add-periodic-payment-btn');
    await page.waitForTimeout(500);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Bank K - No Penalty');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Create Bank L offer with 0.5% penalty
    await page.click('#new-amortization-btn');
    await page.waitForTimeout(500);

    await page.fill('#periodic-amount', '1000');
    await page.fill('#periodic-interval', '12');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '120');
    await page.fill('#periodic-penalty', '0.5');

    await page.click('#add-periodic-payment-btn');
    await page.waitForTimeout(500);

    const titleInput2 = page.locator('#simulation-title-input');
    await titleInput2.click();
    await titleInput2.fill('Bank L - Low Penalty');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Create Bank M offer with 1.0% penalty
    await page.click('#new-amortization-btn');
    await page.waitForTimeout(500);

    await page.fill('#periodic-amount', '1000');
    await page.fill('#periodic-interval', '12');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '120');
    await page.fill('#periodic-penalty', '1.0');

    await page.click('#add-periodic-payment-btn');
    await page.waitForTimeout(500);

    const titleInput3 = page.locator('#simulation-title-input');
    await titleInput3.click();
    await titleInput3.fill('Bank M - High Penalty');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify all three displayed
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Bank K - No Penalty');
    await expect(tableBody).toContainText('Bank L - Low Penalty');
    await expect(tableBody).toContainText('Bank M - High Penalty');

    // Verify simulations saved with different penalty rates
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations).toHaveLength(3);
  });

  test('Scenario 4.4: Mixed Amortization Strategy', async ({ page }) => {
    // Test combining one-off and periodic payments
    await page.goto('/amortization');
    await page.waitForLoadState('networkidle');

    // Add one-off payment
    await page.click('#add-amortization-btn');
    await page.waitForTimeout(300);

    const oneOffItem = page.locator('.amortization-payment-item').last();
    await oneOffItem.locator('input[type="number"]').first().fill('5000');
    await oneOffItem.locator('input[type="number"]').nth(1).fill('24');

    // Add periodic payment
    await page.fill('#periodic-amount', '200');
    await page.fill('#periodic-interval', '3');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '120');
    await page.click('#add-periodic-payment-btn');

    await page.waitForTimeout(500);

    // Save simulation
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Mixed Strategy');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Verify both types of payments saved
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations[0].amortizationPayments).toBeDefined();
    expect(simulations[0].periodicPayments).toBeDefined();
  });
});

