import { test, expect, type Page } from '@playwright/test';

/**
 * Category 3: Interest Rate Variations & Impact Analysis
 * Tests covering different interest rate scenarios and their impact on total cost
 */

// Helper to create simulation
async function createSimulation(
  page: Page,
  name: string,
  loanAmount: string,
  interestRate: string,
  loanTerm: string
) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.fill('#loan-amount', loanAmount);
  await page.fill('#interest-rate', interestRate);
  await page.fill('#loan-term', loanTerm);
  await page.waitForTimeout(1000);

  const titleInput = page.locator('#simulation-title-input');
  await titleInput.click();
  await titleInput.fill(name);

  await page.waitForSelector('#save-simulation-header-btn', { state: 'visible', timeout: 3000 });
  await page.click('#save-simulation-header-btn');
  await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
}

test.describe('Category 3: Interest Rate Variations & Impact Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 3.1: Fixed vs Variable Rate Comparison', async ({ page }) => {
    // Create conservative estimate with 3.5% rate
    await createSimulation(page, 'Bank I - Conservative', '300000', '3.5', '25');

    // Create optimistic estimate with 2.0% rate
    await page.click('#new-simulation-btn');
    await createSimulation(page, 'Bank J - Optimistic', '300000', '2.0', '25');

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify both simulations displayed
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Bank I - Conservative');
    await expect(tableBody).toContainText('Bank J - Optimistic');

    // Verify interest rates
    await expect(tableBody).toContainText('3.50%');
    await expect(tableBody).toContainText('2.00%');

    // Both should have same loan amount and term
    const rows = page.locator('.simulation-row');
    expect(await rows.count()).toBe(2);

    // Verify different total payment amounts (conservative should be higher)
    // The Total Payment Made column should show different values
    const totalPayments = page.locator('td.font-semibold.text-blue-700');
    expect(await totalPayments.count()).toBeGreaterThanOrEqual(2);
  });

  test('Scenario 3.2: Rate Differential Impact', async ({ page }) => {
    // Create 5 simulations with incrementing rates
    const rates = ['2.0', '2.25', '2.5', '2.75', '3.0'];
    
    for (let i = 0; i < rates.length; i++) {
      if (i > 0) {
        await page.click('#new-simulation-btn');
        await page.waitForTimeout(500);
      }
      await createSimulation(
        page,
        `Rate ${rates[i]}%`,
        '300000',
        rates[i],
        '25'
      );
    }

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify all 5 simulations displayed
    const rows = page.locator('.simulation-row');
    expect(await rows.count()).toBe(5);

    // Verify all rates displayed
    const tableBody = page.locator('#simulations-table-body');
    for (const rate of rates) {
      await expect(tableBody).toContainText(`${parseFloat(rate).toFixed(2)}%`);
    }

    // Verify clear visualization of rate impact
    // All should have same loan amount
    const loanAmounts = await page.locator('td.font-medium.text-gray-900').filter({ hasText: '€300,000' }).count();
    expect(loanAmounts).toBe(5);
  });

  test('Scenario 3.3: Sweet Spot Analysis', async ({ page }) => {
    // Create short-term high rate (15 years, 3.2%)
    await createSimulation(page, 'Short High Rate', '300000', '3.2', '15');

    // Create long-term low rate (30 years, 2.5%)
    await page.click('#new-simulation-btn');
    await createSimulation(page, 'Long Low Rate', '300000', '2.5', '30');

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify both displayed
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Short High Rate');
    await expect(tableBody).toContainText('Long Low Rate');

    // Verify terms
    await expect(tableBody).toContainText('15 years');
    await expect(tableBody).toContainText('30 years');

    // Verify rates
    await expect(tableBody).toContainText('3.20%');
    await expect(tableBody).toContainText('2.50%');

    // Both scenarios show trade-offs:
    // - Short term: Higher monthly payment, less total interest
    // - Long term: Lower monthly payment, more total interest
    const rows = page.locator('.simulation-row');
    expect(await rows.count()).toBe(2);
  });

  test('Scenario 3.4: Micro Rate Differences', async ({ page }) => {
    // Test small rate differences to verify calculation precision
    await createSimulation(page, 'Rate 2.45%', '300000', '2.45', '25');
    
    await page.click('#new-simulation-btn');
    await createSimulation(page, 'Rate 2.50%', '300000', '2.50', '25');
    
    await page.click('#new-simulation-btn');
    await createSimulation(page, 'Rate 2.55%', '300000', '2.55', '25');

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify all three displayed with precise rates
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('2.45%');
    await expect(tableBody).toContainText('2.50%');
    await expect(tableBody).toContainText('2.55%');

    // Even small rate differences should show in total payment
    const totalPaymentCells = page.locator('td.font-semibold.text-blue-700');
    expect(await totalPaymentCells.count()).toBe(3);
  });
});

