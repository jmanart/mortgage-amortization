import { test, expect, type Page } from '@playwright/test';

/**
 * Category 2: Service Costs & Bundled Offers
 * Tests covering different service payment configurations and their impact on total cost
 */

// Helper to add a service payment
async function addServicePayment(
  page: Page,
  name: string,
  monthlyCost: string
) {
  await page.click('#add-service-payment-btn');
  await page.waitForTimeout(300);

  // Find the last added service payment item
  const serviceItems = page.locator('.service-payment-item');
  const lastItem = serviceItems.last();

  // Fill in the service payment details
  const nameInput = lastItem.locator('input[placeholder*="Insurance"], input[placeholder*="Service"]').first();
  const costInput = lastItem.locator('input[type="number"]').first();

  await nameInput.fill(name);
  await costInput.fill(monthlyCost);
}

// Helper to create simulation with services
async function createSimulationWithServices(
  page: Page,
  name: string,
  loanAmount: string,
  interestRate: string,
  loanTerm: string,
  services: Array<{ name: string; cost: string }>
) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Fill mortgage details
  await page.fill('#loan-amount', loanAmount);
  await page.fill('#interest-rate', interestRate);
  await page.fill('#loan-term', loanTerm);

  // Add services
  for (const service of services) {
    await addServicePayment(page, service.name, service.cost);
    await page.waitForTimeout(300);
  }

  // Wait for calculation
  await page.waitForTimeout(1000);

  // Save simulation
  const titleInput = page.locator('#simulation-title-input');
  await titleInput.click();
  await titleInput.fill(name);

  await page.waitForSelector('#save-simulation-header-btn', { state: 'visible', timeout: 3000 });
  await page.click('#save-simulation-header-btn');

  await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
}

test.describe('Category 2: Service Costs & Bundled Offers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 2.1: Bank with Mandatory Insurance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter basic mortgage details
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');

    // Add life insurance
    await addServicePayment(page, 'Life Insurance', '50');
    
    // Add home insurance
    await addServicePayment(page, 'Home Insurance', '75');

    // Wait for recalculation
    await page.waitForTimeout(1000);

    // Verify services are added
    const servicesList = page.locator('#service-payments-list');
    await expect(servicesList).toContainText('Life Insurance');
    await expect(servicesList).toContainText('Home Insurance');

    // Save as "Bank D - Full Insurance"
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Bank D - Full Insurance');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Verify saved with services
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations[0].servicePayments).toHaveLength(2);
    expect(simulations[0].servicePayments[0].monthlyCost).toBe('50');
    expect(simulations[0].servicePayments[1].monthlyCost).toBe('75');
  });

  test('Scenario 2.2: Mixed Service Duration', async ({ page }) => {
    // Note: Current implementation doesn't have duration per service
    // This test documents the expected behavior for future implementation
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '30');

    // Add services (duration feature to be implemented)
    await addServicePayment(page, 'Life Insurance - Full Term', '60');
    await addServicePayment(page, 'PMI - 5 Years', '120');

    await page.waitForTimeout(1000);

    // Save simulation
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Bank E - Mixed Duration');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Navigate to compare page
    await page.goto('/compare');
    await expect(page.locator('#simulations-table-body')).toContainText('Bank E - Mixed Duration');
  });

  test('Scenario 2.3: Multiple Service Configurations', async ({ page }) => {
    // Create simulation with no services
    await createSimulationWithServices(
      page,
      'Bank F - No Insurance',
      '300000',
      '2.3',
      '25',
      []
    );

    // Create simulation with minimal services
    await page.click('#new-simulation-btn');
    await createSimulationWithServices(
      page,
      'Bank G - Basic',
      '300000',
      '2.4',
      '25',
      [{ name: 'Basic Life Insurance', cost: '40' }]
    );

    // Create simulation with comprehensive services
    await page.click('#new-simulation-btn');
    await createSimulationWithServices(
      page,
      'Bank H - Premium',
      '300000',
      '2.5',
      '25',
      [
        { name: 'Premium Life Insurance', cost: '80' },
        { name: 'Home Insurance', cost: '100' },
        { name: 'Job Loss Insurance', cost: '50' }
      ]
    );

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify all three simulations displayed
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Bank F - No Insurance');
    await expect(tableBody).toContainText('Bank G - Basic');
    await expect(tableBody).toContainText('Bank H - Premium');

    // Expand Bank H to see service details
    await page.click('.expand-btn[data-name="Bank H - Premium"]');
    const detailsRow = page.locator('.simulation-details-row[data-name="Bank H - Premium"]');
    await expect(detailsRow).toContainText('Premium Life Insurance');
    await expect(detailsRow).toContainText('Home Insurance');
    await expect(detailsRow).toContainText('Job Loss Insurance');
    await expect(detailsRow).toContainText('€230.00'); // Monthly total

    // Expand Bank F to verify no services
    await page.click('.expand-btn[data-name="Bank F - No Insurance"]');
    const noServiceRow = page.locator('.simulation-details-row[data-name="Bank F - No Insurance"]');
    await expect(noServiceRow).toContainText('No service payments');
  });
});

