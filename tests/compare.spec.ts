import { test, expect } from '@playwright/test';

test.describe('Compare Simulations Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/compare');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show no simulations message when none exist', async ({ page }) => {
    await expect(page.locator('#no-simulations-message')).toBeVisible();
    await expect(page.locator('#no-simulations-message')).toContainText('No saved simulations found');
  });

  test('should display saved simulations', async ({ page }) => {
    // Add a test simulation to localStorage
    await page.evaluate(() => {
      const simulation = {
        name: 'Test Mortgage',
        loanAmount: 300000,
        interestRate: 2.5,
        loanTerm: 25,
        startDate: '2025-01-01',
        servicePayments: [],
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('mortgage-calculator-simulations', JSON.stringify([simulation]));
    });
    
    // Reload page to show simulation
    await page.reload();
    
    // Check that simulation appears in table
    await expect(page.locator('#simulations-table-body')).toContainText('Test Mortgage');
    await expect(page.locator('#simulations-table-body')).toContainText('€300,000');
    await expect(page.locator('#simulations-table-body')).toContainText('2.50%');
    await expect(page.locator('#simulations-table-body')).toContainText('25 years');
  });

  test('should expand and collapse simulation details', async ({ page }) => {
    // Add a test simulation with service payments
    await page.evaluate(() => {
      const simulation = {
        name: 'Detailed Simulation',
        loanAmount: 400000,
        interestRate: 3.0,
        loanTerm: 30,
        startDate: '2025-01-01',
        servicePayments: [
          { name: 'Life Insurance', monthlyCost: 50 },
          { name: 'Home Insurance', monthlyCost: 75 }
        ],
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('mortgage-calculator-simulations', JSON.stringify([simulation]));
    });
    
    await page.reload();
    
    // Initially, details should be hidden
    const detailsRow = page.locator('.simulation-details-row[data-name="Detailed Simulation"]');
    await expect(detailsRow).toHaveClass(/hidden/);
    
    // Click expand button
    await page.click('.expand-btn[data-name="Detailed Simulation"]');
    
    // Details should now be visible
    await expect(detailsRow).not.toHaveClass(/hidden/);
    await expect(detailsRow).toContainText('Life Insurance');
    await expect(detailsRow).toContainText('Home Insurance');
    
    // Click again to collapse
    await page.click('.expand-btn[data-name="Detailed Simulation"]');
    
    // Details should be hidden again
    await expect(detailsRow).toHaveClass(/hidden/);
  });

  test('should navigate to load simulation on home page', async ({ page }) => {
    // Add a test simulation
    await page.evaluate(() => {
      const simulation = {
        name: 'Load Test',
        loanAmount: 350000,
        interestRate: 2.8,
        loanTerm: 28,
        startDate: '2025-02-01',
        servicePayments: [],
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('mortgage-calculator-simulations', JSON.stringify([simulation]));
    });
    
    await page.reload();
    
    // Expand details
    await page.click('.expand-btn[data-name="Load Test"]');
    
    // Click load simulation link
    await page.click('a.load-simulation-link');
    
    // Should navigate to home page with load parameter
    await page.waitForURL(/\?load=Load%20Test/);
    
    // Verify we're on the home page
    await expect(page.locator('h1[data-i18n="app.title"]')).toBeVisible();
  });

  test('should compare multiple simulations', async ({ page }) => {
    // Add multiple simulations
    await page.evaluate(() => {
      const simulations = [
        {
          name: 'Option A',
          loanAmount: 300000,
          interestRate: 2.5,
          loanTerm: 25,
          startDate: '2025-01-01',
          servicePayments: [],
          savedAt: new Date().toISOString()
        },
        {
          name: 'Option B',
          loanAmount: 300000,
          interestRate: 3.0,
          loanTerm: 20,
          startDate: '2025-01-01',
          servicePayments: [],
          savedAt: new Date().toISOString()
        },
        {
          name: 'Option C',
          loanAmount: 250000,
          interestRate: 2.8,
          loanTerm: 30,
          startDate: '2025-01-01',
          servicePayments: [],
          savedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('mortgage-calculator-simulations', JSON.stringify(simulations));
    });
    
    await page.reload();
    
    // All three simulations should be visible
    await expect(page.locator('#simulations-table-body')).toContainText('Option A');
    await expect(page.locator('#simulations-table-body')).toContainText('Option B');
    await expect(page.locator('#simulations-table-body')).toContainText('Option C');
    
    // Each should have different values
    const rows = page.locator('.simulation-row');
    await expect(rows).toHaveCount(3);
  });

  test('should handle simulations with service payments correctly', async ({ page }) => {
    // Add simulation with service payments
    await page.evaluate(() => {
      const simulation = {
        name: 'Full Service',
        loanAmount: 500000,
        interestRate: 3.2,
        loanTerm: 30,
        startDate: '2025-01-01',
        servicePayments: [
          { name: 'Life Insurance', monthlyCost: 100 },
          { name: 'Home Insurance', monthlyCost: 150 },
          { name: 'PMI', monthlyCost: 200 }
        ],
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('mortgage-calculator-simulations', JSON.stringify([simulation]));
    });
    
    await page.reload();
    
    // Expand details
    await page.click('.expand-btn[data-name="Full Service"]');
    
    const detailsRow = page.locator('.simulation-details-row[data-name="Full Service"]');
    
    // Should show service payment count
    await expect(detailsRow).toContainText('Count:');
    await expect(detailsRow).toContainText('3');
    
    // Should show monthly total
    await expect(detailsRow).toContainText('Monthly Total:');
    await expect(detailsRow).toContainText('€450.00');
    
    // Should show all service names
    await expect(detailsRow).toContainText('Life Insurance');
    await expect(detailsRow).toContainText('Home Insurance');
    await expect(detailsRow).toContainText('PMI');
  });
});

