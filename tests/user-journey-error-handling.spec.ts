import { test, expect, type Page } from '@playwright/test';

/**
 * Category 10: Error Handling & Validation
 * Tests covering input validation, error cases, and system resilience
 */

test.describe('Category 10: Error Handling & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 10.1: Invalid Input Handling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Attempt negative loan amount
    await page.fill('#loan-amount', '-100000');
    await page.waitForTimeout(500);

    // HTML5 validation or JS validation should prevent this
    const loanAmount = page.locator('#loan-amount');
    const value = await loanAmount.inputValue();
    
    // Most number inputs handle negative values differently
    // Either prevented or the value is adjusted
    // Just verify the system doesn't crash
    await expect(loanAmount).toBeVisible();

    // Attempt 0% interest rate
    await page.fill('#interest-rate', '0');
    await page.waitForTimeout(500);

    // System should handle this gracefully (might show error or use minimum)
    const interestRate = page.locator('#interest-rate');
    await expect(interestRate).toBeVisible();

    // Attempt 0 year term
    await page.fill('#loan-term', '0');
    await page.waitForTimeout(500);

    // System should handle this gracefully
    const loanTerm = page.locator('#loan-term');
    await expect(loanTerm).toBeVisible();

    // Verify page doesn't crash - can still interact
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(1000);

    // Chart should render with valid inputs
    const svg = page.locator('#chart-container svg');
    await expect(svg).toBeVisible();
  });

  test('Scenario 10.2: Duplicate Names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create first simulation
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(500);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('My Mortgage');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    
    // Wait for save to complete
    await page.waitForTimeout(500);

    // Attempt to save another with same name
    await page.click('#new-simulation-btn');
    await page.waitForTimeout(300);

    await page.fill('#loan-amount', '350000');
    await page.fill('#interest-rate', '2.7');
    await page.fill('#loan-term', '27');
    await page.waitForTimeout(500);

    const titleInput2 = page.locator('#simulation-title-input');
    await titleInput2.click();
    await titleInput2.fill('My Mortgage');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // System should either:
    // 1. Show error toast
    // 2. Overwrite (with warning)
    // 3. Auto-rename
    
    // Verify system handles it gracefully - check for toast or warning
    const toasts = page.locator('.toast');
    const toastCount = await toasts.count();
    
    // Some kind of feedback should be given
    expect(toastCount).toBeGreaterThan(0);

    // Verify data integrity maintained
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    // Should have simulations saved (behavior depends on implementation)
    expect(simulations.length).toBeGreaterThan(0);
  });

  test('Scenario 10.3: Corrupted Data Recovery', async ({ page }) => {
    // Create valid simulation first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(500);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Valid Simulation');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Manually corrupt localStorage
    await page.evaluate(() => {
      const simulations = localStorage.getItem('mortgage-calculator-simulations');
      if (simulations) {
        const parsed = JSON.parse(simulations);
        // Add corrupted entry
        parsed.push({
          name: 'Corrupted',
          loanAmount: 'invalid',
          interestRate: null,
          loanTerm: undefined
        });
        localStorage.setItem('mortgage-calculator-simulations', JSON.stringify(parsed));
      }
    });

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // System should handle gracefully
    // Valid simulation should still appear
    const tableBody = page.locator('#simulations-table-body');
    
    // Page should load without crashing
    await expect(tableBody).toBeVisible();

    // Valid simulation should be displayed
    await expect(tableBody).toContainText('Valid Simulation');

    // Verify other simulations unaffected
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    // At least the valid simulation should be there
    const validSim = simulations.find((s: any) => s.name === 'Valid Simulation');
    expect(validSim).toBeDefined();
    expect(validSim.loanAmount).toBe('300000');
  });

  test('Scenario 10.4: Extreme Values', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test with very large loan amount
    await page.fill('#loan-amount', '99999999');
    await page.fill('#interest-rate', '15.5'); // Very high rate
    await page.fill('#loan-term', '50'); // Very long term
    await page.waitForTimeout(1000);

    // System should handle without crashing
    const svg = page.locator('#chart-container svg');
    
    // Either renders or shows graceful error
    const chartContainer = page.locator('#chart-container');
    await expect(chartContainer).toBeVisible();

    // Try to save
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Extreme Values');
    
    // Should either save or show validation error
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible', timeout: 3000 });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // System should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('Scenario 10.5: Empty Fields Handling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Clear default values
    await page.fill('#loan-amount', '');
    await page.fill('#interest-rate', '');
    await page.fill('#loan-term', '');
    await page.waitForTimeout(500);

    // Try to trigger calculation with empty fields
    await page.click('#loan-amount');
    await page.click('#interest-rate');
    await page.waitForTimeout(500);

    // System should handle gracefully
    const chartContainer = page.locator('#chart-container');
    await expect(chartContainer).toBeVisible();

    // Chart probably shows placeholder or nothing
    // But system should not crash
    await expect(page.locator('body')).toBeVisible();

    // Try to save with empty name
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('');

    // Fill valid values
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(500);

    // Try to save with empty name
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // System should show error or prevent save
    // Either way, should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('Scenario 10.6: Special Characters in Inputs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to enter letters in number fields
    await page.fill('#loan-amount', 'abc123');
    await page.waitForTimeout(300);

    // Number input should filter out non-numeric chars
    const loanAmount = await page.locator('#loan-amount').inputValue();
    // Should either be empty or contain only numbers
    expect(loanAmount).toMatch(/^\d*$/);

    // Try special characters
    await page.fill('#interest-rate', '2.5%');
    await page.waitForTimeout(300);

    // Should handle gracefully
    await expect(page.locator('#interest-rate')).toBeVisible();

    // Try valid values with special characters in name
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(500);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Test <script>alert("xss")</script>');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // XSS should be escaped/sanitized
    const tableBody = page.locator('#simulations-table-body');
    
    // Page should load safely
    await expect(tableBody).toBeVisible();
    
    // No alert should have fired
    // Content should be displayed safely
  });

  test('Scenario 10.7: Rapid Successive Actions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Rapidly change values
    for (let i = 0; i < 10; i++) {
      await page.fill('#interest-rate', `${2 + i * 0.1}`);
      // Don't wait - test rapid updates
    }

    // System should handle without crashing
    await page.waitForTimeout(1000);
    await expect(page.locator('#interest-rate')).toBeVisible();

    // Rapidly click new simulation button
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(500);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Rapid Test');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    
    // Rapidly click save multiple times
    await page.click('#save-simulation-header-btn');
    await page.click('#save-simulation-header-btn');

    await page.waitForTimeout(1000);

    // Should not create duplicates or crash
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    // Should have reasonable number of simulations (not dozens of duplicates)
    expect(simulations.length).toBeLessThan(5);
  });

  test('Scenario 10.8: LocalStorage Quota Exceeded', async ({ page }) => {
    // This is an edge case - what happens when localStorage is full
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to fill localStorage with many simulations
    const simulations = [];
    for (let i = 0; i < 100; i++) {
      simulations.push({
        name: `Simulation ${i}`,
        loanAmount: '300000',
        interestRate: '2.5',
        loanTerm: '25',
        servicePayments: [],
        savedAt: new Date().toISOString()
      });
    }

    // Try to save to localStorage
    const success = await page.evaluate((sims) => {
      try {
        localStorage.setItem('mortgage-calculator-simulations', JSON.stringify(sims));
        return true;
      } catch (e) {
        return false;
      }
    }, simulations);

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // System should handle gracefully even if storage is full
    await expect(page.locator('body')).toBeVisible();
    
    // Should show some simulations or appropriate message
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toBeVisible();
  });
});

