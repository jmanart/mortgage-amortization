import { test, expect, type Page } from '@playwright/test';

/**
 * Category 5: Real-World Bank Offer Comparisons
 * Tests covering realistic, complete bank offer scenarios
 */

// Helper to add service payment
async function addService(page: Page, name: string, cost: string) {
  await page.click('#add-service-payment-btn');
  await page.waitForTimeout(300);
  
  const serviceItem = page.locator('.service-payment-item').last();
  await serviceItem.locator('input').first().fill(name);
  await serviceItem.locator('input[type="number"]').fill(cost);
}

// Helper to create complete offer
async function createCompleteOffer(
  page: Page,
  name: string,
  loanAmount: string,
  interestRate: string,
  loanTerm: string,
  services: Array<{ name: string; cost: string }>
) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.fill('#loan-amount', loanAmount);
  await page.fill('#interest-rate', interestRate);
  await page.fill('#loan-term', loanTerm);

  for (const service of services) {
    await addService(page, service.name, service.cost);
  }

  await page.waitForTimeout(1000);

  const titleInput = page.locator('#simulation-title-input');
  await titleInput.click();
  await titleInput.fill(name);

  await page.waitForSelector('#save-simulation-header-btn', { state: 'visible', timeout: 3000 });
  await page.click('#save-simulation-header-btn');
  await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
}

test.describe('Category 5: Real-World Bank Offer Comparisons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 5.1: Complete Offer A (Premium Package)', async ({ page }) => {
    // 350k loan, 2.3% rate, 25 years
    // Life insurance: 80/month
    // Home insurance: 100/month
    // Bank fees: 30/month for first 2 years
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.fill('#loan-amount', '350000');
    await page.fill('#interest-rate', '2.3');
    await page.fill('#loan-term', '25');

    // Add services
    await addService(page, 'Life Insurance', '80');
    await addService(page, 'Home Insurance', '100');
    await addService(page, 'Bank Fees (2y)', '30');

    await page.waitForTimeout(1000);

    // Verify services are added
    const servicesList = page.locator('#service-payments-list');
    await expect(servicesList).toContainText('Life Insurance');
    await expect(servicesList).toContainText('Home Insurance');
    await expect(servicesList).toContainText('Bank Fees');

    // Save
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Offer A - Premium Package');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Verify all details persist
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations).toHaveLength(1);
    expect(simulations[0].name).toBe('Offer A - Premium Package');
    expect(simulations[0].loanAmount).toBe('350000');
    expect(simulations[0].interestRate).toBe('2.3');
    expect(simulations[0].loanTerm).toBe('25');
    expect(simulations[0].servicePayments).toHaveLength(3);
  });

  test('Scenario 5.2: Complete Offer B (Economy Package)', async ({ page }) => {
    // 350k loan, 2.8% rate, 25 years
    // Mandatory life insurance: 50/month
    // 0.5% early repayment penalty (note: penalty is set at amortization page)
    
    await createCompleteOffer(
      page,
      'Offer B - Economy Package',
      '350000',
      '2.8',
      '25',
      [{ name: 'Mandatory Life Insurance', cost: '50' }]
    );

    // Verify saved
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations).toHaveLength(1);
    expect(simulations[0].name).toBe('Offer B - Economy Package');
    expect(simulations[0].interestRate).toBe('2.8');
    expect(simulations[0].servicePayments).toHaveLength(1);
    expect(simulations[0].servicePayments[0].monthlyCost).toBe('50');
  });

  test('Scenario 5.3: Complete Offer C (Flexible Package)', async ({ page }) => {
    // 350k loan, 2.5% rate, 30 years
    // Optional services (none selected)
    // 0% penalty after 5 years
    // Plan for yearly 5k extra payments
    
    await createCompleteOffer(
      page,
      'Offer C - Flexible Package',
      '350000',
      '2.5',
      '30',
      [] // No services
    );

    // Verify saved with no services
    let simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations).toHaveLength(1);
    expect(simulations[0].servicePayments).toEqual([]);
  });

  test('Scenario 5.4: Side-by-Side Comparison', async ({ page }) => {
    // Create all three offers
    
    // Offer A - Premium
    await createCompleteOffer(
      page,
      'Offer A - Premium',
      '350000',
      '2.3',
      '25',
      [
        { name: 'Life Insurance', cost: '80' },
        { name: 'Home Insurance', cost: '100' },
        { name: 'Bank Fees', cost: '30' }
      ]
    );

    // Offer B - Economy
    await page.click('#new-simulation-btn');
    await createCompleteOffer(
      page,
      'Offer B - Economy',
      '350000',
      '2.8',
      '25',
      [{ name: 'Life Insurance', cost: '50' }]
    );

    // Offer C - Flexible
    await page.click('#new-simulation-btn');
    await createCompleteOffer(
      page,
      'Offer C - Flexible',
      '350000',
      '2.5',
      '30',
      []
    );

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify all three offers displayed
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Offer A - Premium');
    await expect(tableBody).toContainText('Offer B - Economy');
    await expect(tableBody).toContainText('Offer C - Flexible');

    // Verify all have same loan amount
    const loanAmountCells = await page.locator('td').filter({ hasText: '€350,000' }).count();
    expect(loanAmountCells).toBe(3);

    // Verify different interest rates
    await expect(tableBody).toContainText('2.30%');
    await expect(tableBody).toContainText('2.80%');
    await expect(tableBody).toContainText('2.50%');

    // Verify different terms
    await expect(tableBody).toContainText('25 years');
    await expect(tableBody).toContainText('30 years');

    // Expand Offer A to see service details
    await page.click('.expand-btn[data-name="Offer A - Premium"]');
    const offerADetails = page.locator('.simulation-details-row[data-name="Offer A - Premium"]');
    await expect(offerADetails).toContainText('Life Insurance');
    await expect(offerADetails).toContainText('Home Insurance');
    await expect(offerADetails).toContainText('Bank Fees');
    await expect(offerADetails).toContainText('€210.00'); // Total monthly services

    // Expand Offer B
    await page.click('.expand-btn[data-name="Offer B - Economy"]');
    const offerBDetails = page.locator('.simulation-details-row[data-name="Offer B - Economy"]');
    await expect(offerBDetails).toContainText('Life Insurance');
    await expect(offerBDetails).toContainText('€50.00');

    // Expand Offer C
    await page.click('.expand-btn[data-name="Offer C - Flexible"]');
    const offerCDetails = page.locator('.simulation-details-row[data-name="Offer C - Flexible"]');
    await expect(offerCDetails).toContainText('No service payments');

    // Verify total payment calculations exist for all
    const totalPaymentCells = page.locator('td.font-semibold.text-blue-700');
    expect(await totalPaymentCells.count()).toBe(3);
  });

  test('Scenario 5.5: Identify Best Value', async ({ page }) => {
    // Create three realistic offers and verify comparison helps decision
    
    // Low rate, high services
    await createCompleteOffer(
      page,
      'Bank Alpha - 2.2%',
      '300000',
      '2.2',
      '25',
      [
        { name: 'Life Insurance', cost: '70' },
        { name: 'Home Insurance', cost: '90' }
      ]
    );

    // Medium rate, medium services
    await page.click('#new-simulation-btn');
    await createCompleteOffer(
      page,
      'Bank Beta - 2.5%',
      '300000',
      '2.5',
      '25',
      [{ name: 'Basic Insurance', cost: '50' }]
    );

    // Higher rate, no services
    await page.click('#new-simulation-btn');
    await createCompleteOffer(
      page,
      'Bank Gamma - 2.8%',
      '300000',
      '2.8',
      '25',
      []
    );

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // All three should be visible for comparison
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Bank Alpha');
    await expect(tableBody).toContainText('Bank Beta');
    await expect(tableBody).toContainText('Bank Gamma');

    // User can now make informed decision based on:
    // - Interest rates (2.2%, 2.5%, 2.8%)
    // - Monthly service costs (160, 50, 0)
    // - Total payment over life of loan
    
    const rows = page.locator('.simulation-row');
    expect(await rows.count()).toBe(3);
  });
});

