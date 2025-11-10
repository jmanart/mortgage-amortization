import { test, expect, type Page } from '@playwright/test';

/**
 * Category 6: Edge Cases & Data Integrity
 * Tests covering edge cases, data management, and system reliability
 */

// Helper to create simulation quickly
async function quickCreateSimulation(
  page: Page,
  name: string,
  loanAmount: string,
  interestRate: string,
  loanTerm: string
) {
  await page.fill('#loan-amount', loanAmount);
  await page.fill('#interest-rate', interestRate);
  await page.fill('#loan-term', loanTerm);
  await page.waitForTimeout(500);

  const titleInput = page.locator('#simulation-title-input');
  await titleInput.click();
  await titleInput.fill(name);

  await page.waitForSelector('#save-simulation-header-btn', { state: 'visible', timeout: 3000 });
  await page.click('#save-simulation-header-btn');
  await page.waitForTimeout(500);
}

test.describe('Category 6: Edge Cases & Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 6.1: Maximum Capacity Test', async ({ page }) => {
    // Create 10+ different simulations
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const simulationData = [
      { name: 'Sim 01', amount: '250000', rate: '2.0', term: '20' },
      { name: 'Sim 02', amount: '275000', rate: '2.2', term: '22' },
      { name: 'Sim 03', amount: '300000', rate: '2.4', term: '24' },
      { name: 'Sim 04', amount: '325000', rate: '2.6', term: '26' },
      { name: 'Sim 05', amount: '350000', rate: '2.8', term: '28' },
      { name: 'Sim 06', amount: '375000', rate: '3.0', term: '30' },
      { name: 'Sim 07', amount: '400000', rate: '3.2', term: '25' },
      { name: 'Sim 08', amount: '425000', rate: '3.4', term: '23' },
      { name: 'Sim 09', amount: '450000', rate: '3.6', term: '21' },
      { name: 'Sim 10', amount: '475000', rate: '3.8', term: '19' },
      { name: 'Sim 11', amount: '500000', rate: '4.0', term: '18' },
      { name: 'Sim 12', amount: '525000', rate: '4.2', term: '17' }
    ];

    for (let i = 0; i < simulationData.length; i++) {
      if (i > 0) {
        await page.click('#new-simulation-btn');
        await page.waitForTimeout(300);
      }
      
      const sim = simulationData[i];
      await quickCreateSimulation(page, sim.name, sim.amount, sim.rate, sim.term);
    }

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify all load correctly
    const rows = page.locator('.simulation-row');
    const rowCount = await rows.count();
    expect(rowCount).toBe(12);

    // Test UI responsiveness - all simulations should be displayed
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Sim 01');
    await expect(tableBody).toContainText('Sim 12');

    // Test scrolling and visibility
    await page.locator('.simulation-row').last().scrollIntoViewIfNeeded();
    await expect(page.locator('.simulation-row').last()).toBeVisible();
  });

  test('Scenario 6.2: Simulation Management', async ({ page }) => {
    // Create simulation
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(1000);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Original Name');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Rename it
    await titleInput.click();
    await titleInput.fill('Renamed Simulation');
    await titleInput.blur();
    await page.waitForTimeout(500);

    // Verify rename
    let simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });
    expect(simulations[0].name).toBe('Renamed Simulation');

    // Delete it
    page.on('dialog', dialog => dialog.accept()); // Auto-accept confirmation
    await page.click('#delete-simulation-header-btn');
    await page.waitForTimeout(500);

    // Verify deletion
    simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });
    expect(simulations).toHaveLength(0);

    // Confirm removal from compare page
    await page.goto('/compare');
    await expect(page.locator('#no-simulations-message')).toBeVisible();
  });

  test('Scenario 6.3: Load and Modify Workflow', async ({ page }) => {
    // Create and save simulation
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(1000);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Base Simulation');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Navigate to compare page and load it
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    
    await page.click('.expand-btn[data-name="Base Simulation"]');
    await page.click('a.load-simulation-link');
    await page.waitForURL('**/');

    // Verify loaded
    await expect(page.locator('#simulation-title-input')).toHaveValue('Base Simulation');
    await expect(page.locator('#loan-amount')).toHaveValue('300000');

    // Modify interest rate
    await page.fill('#interest-rate', '3.0');
    await page.waitForTimeout(500);

    // Verify unsaved changes indicator
    await expect(page.locator('#unsaved-indicator')).toBeVisible();

    // Save as new simulation with different name
    await titleInput.click();
    await titleInput.clear();
    await titleInput.fill('Modified Simulation');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Verify original unchanged
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations).toHaveLength(2);
    const baseSimulation = simulations.find((s: any) => s.name === 'Base Simulation');
    const modifiedSimulation = simulations.find((s: any) => s.name === 'Modified Simulation');

    expect(baseSimulation.interestRate).toBe('2.5');
    expect(modifiedSimulation.interestRate).toBe('3.0');
  });

  test('Scenario 6.4: Browser Session Persistence', async ({ page, context }) => {
    // Create multiple simulations
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await quickCreateSimulation(page, 'Sim A', '300000', '2.5', '25');
    await page.click('#new-simulation-btn');
    await quickCreateSimulation(page, 'Sim B', '350000', '2.7', '27');
    await page.click('#new-simulation-btn');
    await quickCreateSimulation(page, 'Sim C', '400000', '2.9', '29');

    // Store expected data
    const expectedSimulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    // Close and reopen browser (create new page in same context to maintain localStorage)
    await page.close();
    const newPage = await context.newPage();
    
    // Navigate to compare page
    await newPage.goto('/compare');
    await newPage.waitForLoadState('networkidle');

    // Verify all simulations persist
    const tableBody = newPage.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Sim A');
    await expect(tableBody).toContainText('Sim B');
    await expect(tableBody).toContainText('Sim C');

    // Verify calculations remain accurate
    await expect(tableBody).toContainText('€300,000');
    await expect(tableBody).toContainText('€350,000');
    await expect(tableBody).toContainText('€400,000');

    await expect(tableBody).toContainText('2.50%');
    await expect(tableBody).toContainText('2.70%');
    await expect(tableBody).toContainText('2.90%');

    // Verify localStorage data intact
    const persistedSimulations = await newPage.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(persistedSimulations).toHaveLength(3);
    expect(persistedSimulations[0].name).toBe('Sim A');
    expect(persistedSimulations[1].name).toBe('Sim B');
    expect(persistedSimulations[2].name).toBe('Sim C');
  });

  test('Scenario 6.5: Concurrent Modification Handling', async ({ page }) => {
    // Create initial simulation
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await quickCreateSimulation(page, 'Test Sim', '300000', '2.5', '25');

    // Load simulation
    await page.click('#load-simulation-menu-btn');
    await page.waitForSelector('#load-modal:not(.hidden)');
    await page.click('button.load-simulation-btn[data-name="Test Sim"]');
    await page.waitForTimeout(500);

    // Modify without saving
    await page.fill('#interest-rate', '3.0');
    await page.waitForTimeout(500);

    // Verify unsaved indicator
    await expect(page.locator('#unsaved-indicator')).toBeVisible();

    // Try to create new simulation without saving changes
    await page.click('#new-simulation-btn');
    await page.waitForTimeout(500);

    // Form should be cleared
    await expect(page.locator('#loan-amount')).toHaveValue('300000');
    await expect(page.locator('#interest-rate')).toHaveValue('2.2');
  });

  test('Scenario 6.6: Large Numbers Handling', async ({ page }) => {
    // Test with very large loan amounts
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.fill('#loan-amount', '10000000'); // 10 million
    await page.fill('#interest-rate', '4.5');
    await page.fill('#loan-term', '30');
    await page.waitForTimeout(1000);

    // Verify chart still renders
    const svg = page.locator('#chart-container svg');
    await expect(svg).toBeVisible();

    // Save and verify
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Large Loan');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Go to compare page and verify formatting
    await page.goto('/compare');
    await expect(page.locator('#simulations-table-body')).toContainText('€10,000,000');
  });
});

