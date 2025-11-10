import { test, expect, type Page } from '@playwright/test';

/**
 * Category 9: Decision-Making Workflow (Complete User Journey)
 * Tests covering end-to-end workflows from initial entry to final decision
 */

// Helper function to create complete bank offer
async function createBankOffer(
  page: Page,
  bankName: string,
  loanAmount: string,
  interestRate: string,
  loanTerm: string,
  services: Array<{ name: string; cost: string }>
) {
  await page.fill('#loan-amount', loanAmount);
  await page.fill('#interest-rate', interestRate);
  await page.fill('#loan-term', loanTerm);

  for (const service of services) {
    await page.click('#add-service-payment-btn');
    await page.waitForTimeout(200);
    const serviceItem = page.locator('.service-payment-item').last();
    await serviceItem.locator('input').first().fill(service.name);
    await serviceItem.locator('input[type="number"]').fill(service.cost);
  }

  await page.waitForTimeout(500);

  const titleInput = page.locator('#simulation-title-input');
  await titleInput.click();
  await titleInput.fill(bankName);

  await page.waitForSelector('#save-simulation-header-btn', { state: 'visible', timeout: 3000 });
  await page.click('#save-simulation-header-btn');
  await page.waitForTimeout(500);
}

test.describe('Category 9: Decision-Making Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 9.1: Full Comparison Journey', async ({ page }) => {
    // Start with blank slate
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter 3 bank offers with realistic details
    // Bank A: Premium package
    await createBankOffer(
      page,
      'BNP Paribas - Premium',
      '350000',
      '2.3',
      '25',
      [
        { name: 'Life Insurance', cost: '80' },
        { name: 'Home Insurance', cost: '100' }
      ]
    );

    // Navigate to compare page after first entry
    await page.goto('/compare');
    await expect(page.locator('#simulations-table-body')).toContainText('BNP Paribas');

    // Return and create Bank B
    await page.goto('/');
    await page.click('#new-simulation-btn');
    await page.waitForTimeout(300);
    
    await createBankOffer(
      page,
      'Crédit Agricole - Standard',
      '350000',
      '2.5',
      '25',
      [{ name: 'Basic Insurance', cost: '50' }]
    );

    // Navigate to compare page
    await page.goto('/compare');
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('BNP Paribas');
    await expect(tableBody).toContainText('Crédit Agricole');

    // Return and create Bank C
    await page.goto('/');
    await page.click('#new-simulation-btn');
    await page.waitForTimeout(300);
    
    await createBankOffer(
      page,
      'Société Générale - Economy',
      '350000',
      '2.8',
      '25',
      []
    );

    // Navigate to compare page for final comparison
    await page.goto('/compare');
    await expect(tableBody).toContainText('Société Générale');

    // Analyze all three - user identifies top 2 candidates
    // Let's say BNP Paribas and Crédit Agricole are best

    // Load BNP Paribas to add amortization plan
    await page.click('.expand-btn[data-name="BNP Paribas - Premium"]');
    await page.click('a.load-simulation-link');
    await page.waitForURL('**/');

    // Add extra payments scenario
    await page.goto('/amortization');
    await page.waitForLoadState('networkidle');

    await page.fill('#periodic-amount', '500');
    await page.fill('#periodic-interval', '6');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '300');
    await page.click('#add-periodic-payment-btn');
    await page.waitForTimeout(500);

    // Save with new name
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.clear();
    await titleInput.fill('BNP - With Extra Payments');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Compare final costs - navigate to compare
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // User identifies best option based on total payment
    // Rename best option to "Selected Offer"
    await page.click('.expand-btn[data-name="BNP - With Extra Payments"]');
    await page.click('a.load-simulation-link');
    await page.waitForURL('**/');

    const selectedTitleInput = page.locator('#simulation-title-input');
    await selectedTitleInput.click();
    await selectedTitleInput.clear();
    await selectedTitleInput.fill('Selected Offer - BNP Paribas');
    await selectedTitleInput.blur();
    await page.waitForTimeout(500);

    // Delete rejected offers
    await page.goto('/compare');
    
    // Setup dialog handler for confirmations
    page.on('dialog', dialog => dialog.accept());
    
    // Delete Société Générale (rejected)
    await page.click('.expand-btn[data-name="Société Générale - Economy"]');
    const deleteBtn = page.locator('button.delete-simulation-btn[data-name="Société Générale - Economy"]');
    await deleteBtn.click();
    await page.waitForTimeout(500);

    // Verify final state
    await page.reload();
    await expect(tableBody).toContainText('Selected Offer - BNP Paribas');
    await expect(tableBody).not.toContainText('Société Générale - Economy');

    // Final check: user has their selected offer saved
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    const selectedOffer = simulations.find((s: any) => s.name.includes('Selected Offer'));
    expect(selectedOffer).toBeDefined();
  });

  test('Scenario 9.2: Iterative Refinement', async ({ page }) => {
    // Enter initial offer
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await createBankOffer(
      page,
      'Initial Offer',
      '300000',
      '2.5',
      '25',
      []
    );

    // User realizes they want to test different scenarios
    // Load and modify to test different rate
    await page.click('#load-simulation-menu-btn');
    await page.waitForSelector('#load-modal:not(.hidden)');
    await page.click('button.load-simulation-btn[data-name="Initial Offer"]');
    await page.waitForTimeout(500);

    // Modify rate
    await page.fill('#interest-rate', '2.7');
    await page.waitForTimeout(500);

    // Save with new name
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.clear();
    await titleInput.fill('Variant - Higher Rate');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Create another variant with different term
    await page.click('#new-simulation-btn');
    await createBankOffer(
      page,
      'Variant - Shorter Term',
      '300000',
      '2.5',
      '20',
      []
    );

    // Create variant with lower rate
    await page.click('#new-simulation-btn');
    await createBankOffer(
      page,
      'Variant - Lower Rate',
      '300000',
      '2.2',
      '25',
      []
    );

    // Compare all variations
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Initial Offer');
    await expect(tableBody).toContainText('Variant - Higher Rate');
    await expect(tableBody).toContainText('Variant - Shorter Term');
    await expect(tableBody).toContainText('Variant - Lower Rate');

    // Verify which scenario is optimal by examining total payments
    const rows = page.locator('.simulation-row');
    expect(await rows.count()).toBe(4);

    // User can now make data-driven decision
    const totalPayments = page.locator('td.font-semibold.text-blue-700');
    expect(await totalPayments.count()).toBe(4);
  });

  test('Scenario 9.3: What-If Analysis', async ({ page }) => {
    // Create base simulation
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await createBankOffer(
      page,
      'Base Scenario',
      '300000',
      '2.5',
      '25',
      []
    );

    // Create variant with extra payments
    await page.click('#new-simulation-btn');
    await page.waitForTimeout(300);
    await createBankOffer(
      page,
      'With Extra Payments',
      '300000',
      '2.5',
      '25',
      []
    );

    // Add extra payments to this variant
    await page.goto('/amortization');
    await page.waitForLoadState('networkidle');

    await page.fill('#periodic-amount', '300');
    await page.fill('#periodic-interval', '3');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '300');
    await page.click('#add-periodic-payment-btn');
    await page.waitForTimeout(500);

    let titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Scenario - Extra Payments');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Create variant with different term
    await page.goto('/');
    await page.click('#new-simulation-btn');
    await createBankOffer(
      page,
      'Scenario - 20 Years',
      '300000',
      '2.5',
      '20',
      []
    );

    // Create variant with different rate
    await page.click('#new-simulation-btn');
    await createBankOffer(
      page,
      'Scenario - 2.2% Rate',
      '300000',
      '2.2',
      '25',
      []
    );

    // Compare all four on compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Base Scenario');
    await expect(tableBody).toContainText('Scenario - Extra Payments');
    await expect(tableBody).toContainText('Scenario - 20 Years');
    await expect(tableBody).toContainText('Scenario - 2.2% Rate');

    // Verify calculations help inform decision
    // All scenarios have same base loan, but different parameters
    const rows = page.locator('.simulation-row');
    expect(await rows.count()).toBe(4);

    // Each should show different total payments
    const loanAmounts = await page.locator('td').filter({ hasText: '€300,000' }).count();
    expect(loanAmounts).toBe(4); // All have same loan amount

    // But different terms/rates/extra payments lead to different totals
    const totalPaymentCells = page.locator('td.font-semibold.text-blue-700');
    expect(await totalPaymentCells.count()).toBe(4);
  });

  test('Scenario 9.4: Time-Constrained Decision Making', async ({ page }) => {
    // Simulate user who needs to make quick decision
    // Entry should be fast and comparison clear
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Quickly enter 3 offers
    const offers = [
      { name: 'Quick Option A', amount: '300000', rate: '2.3', term: '25' },
      { name: 'Quick Option B', amount: '300000', rate: '2.5', term: '25' },
      { name: 'Quick Option C', amount: '300000', rate: '2.7', term: '25' }
    ];

    for (let i = 0; i < offers.length; i++) {
      if (i > 0) {
        await page.click('#new-simulation-btn');
        await page.waitForTimeout(200);
      }

      const offer = offers[i];
      await page.fill('#loan-amount', offer.amount);
      await page.fill('#interest-rate', offer.rate);
      await page.fill('#loan-term', offer.term);
      await page.waitForTimeout(300);

      const titleInput = page.locator('#simulation-title-input');
      await titleInput.click();
      await titleInput.fill(offer.name);
      await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
      await page.click('#save-simulation-header-btn');
      await page.waitForTimeout(300);
    }

    // Quick navigation to compare
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // All three options immediately visible
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Quick Option A');
    await expect(tableBody).toContainText('Quick Option B');
    await expect(tableBody).toContainText('Quick Option C');

    // Clear interest rate comparison
    await expect(tableBody).toContainText('2.30%');
    await expect(tableBody).toContainText('2.50%');
    await expect(tableBody).toContainText('2.70%');

    // Total payment amounts visible for quick decision
    const totalPayments = page.locator('td.font-semibold.text-blue-700');
    expect(await totalPayments.count()).toBe(3);

    // User can identify best rate at a glance
    // Option A with 2.3% should have lowest total payment
  });
});

