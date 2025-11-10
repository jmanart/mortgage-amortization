import { test, expect, type Page } from '@playwright/test';

/**
 * Category 1: Initial Offer Entry & Basic Comparison
 * Tests covering the basic workflow of entering and comparing mortgage offers
 */

// Helper function to create and save a simulation
async function createAndSaveSimulation(
  page: Page,
  name: string,
  loanAmount: string,
  interestRate: string,
  loanTerm: string
) {
  // Navigate to home page
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Fill in mortgage details
  await page.fill('#loan-amount', loanAmount);
  await page.fill('#interest-rate', interestRate);
  await page.fill('#loan-term', loanTerm);

  // Wait for calculation
  await page.waitForTimeout(1000);

  // Enter simulation name
  const titleInput = page.locator('#simulation-title-input');
  await titleInput.click();
  await titleInput.fill(name);

  // Wait for save button to appear and click it
  await page.waitForSelector('#save-simulation-header-btn', { state: 'visible', timeout: 3000 });
  await page.click('#save-simulation-header-btn');

  // Wait for success toast
  await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
}

test.describe('Category 1: Initial Offer Entry & Basic Comparison', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 1.1: Enter First Bank Offer', async ({ page }) => {
    // User enters basic mortgage details from Bank A (300k, 2.5%, 25 years)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fill in form
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');

    // Wait for chart to render
    await page.waitForTimeout(1000);

    // Verify chart is displayed
    const chartContainer = page.locator('#chart-container');
    const svg = chartContainer.locator('svg');
    await expect(svg).toBeVisible();

    // Name and save simulation
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Bank A - Standard');

    // Save simulation
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');

    // Verify successful save
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Verify simulation saved in localStorage
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations).toHaveLength(1);
    expect(simulations[0].name).toBe('Bank A - Standard');
    expect(simulations[0].loanAmount).toBe('300000');
    expect(simulations[0].interestRate).toBe('2.5');
    expect(simulations[0].loanTerm).toBe('25');
  });

  test('Scenario 1.2: Enter Competing Offers', async ({ page }) => {
    // Create Bank A offer
    await createAndSaveSimulation(page, 'Bank A - Standard', '300000', '2.5', '25');

    // Create new simulation for Bank B
    await page.click('#new-simulation-btn');
    await page.waitForTimeout(500);
    await createAndSaveSimulation(page, 'Bank B - Low Rate', '300000', '2.2', '25');

    // Create new simulation for Bank C
    await page.click('#new-simulation-btn');
    await page.waitForTimeout(500);
    await createAndSaveSimulation(page, 'Bank C - Short Term', '300000', '2.8', '20');

    // Verify all three simulations persist in localStorage
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations).toHaveLength(3);
    expect(simulations.map((s: any) => s.name)).toEqual([
      'Bank A - Standard',
      'Bank B - Low Rate',
      'Bank C - Short Term'
    ]);
  });

  test('Scenario 1.3: Quick Comparison View', async ({ page }) => {
    // Create three offers
    await createAndSaveSimulation(page, 'Bank A - Standard', '300000', '2.5', '25');
    await page.click('#new-simulation-btn');
    await createAndSaveSimulation(page, 'Bank B - Low Rate', '300000', '2.2', '25');
    await page.click('#new-simulation-btn');
    await createAndSaveSimulation(page, 'Bank C - Short Term', '300000', '2.8', '20');

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify all three offers displayed in table
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Bank A - Standard');
    await expect(tableBody).toContainText('Bank B - Low Rate');
    await expect(tableBody).toContainText('Bank C - Short Term');

    // Verify loan amounts displayed
    await expect(tableBody).toContainText('€300,000');

    // Verify interest rates displayed
    await expect(tableBody).toContainText('2.50%');
    await expect(tableBody).toContainText('2.20%');
    await expect(tableBody).toContainText('2.80%');

    // Verify loan terms displayed
    await expect(tableBody).toContainText('25 years');
    await expect(tableBody).toContainText('20 years');

    // Check expandable details
    await page.click('.expand-btn[data-name="Bank A - Standard"]');
    const detailsRow = page.locator('.simulation-details-row[data-name="Bank A - Standard"]');
    await expect(detailsRow).not.toHaveClass(/hidden/);
    await expect(detailsRow).toContainText('Service Payments');
  });
});

