import { test, expect } from '@playwright/test';

test.describe('Mortgage Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page with default values', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Mortgage Amortization Calculator/);
    
    // Check that the main heading is visible
    await expect(page.locator('h1')).toContainText('Mortgage Amortization Calculator');
    
    // Check that form fields have default values
    const loanAmount = page.locator('#loan-amount');
    await expect(loanAmount).toHaveValue('300000');
    
    const interestRate = page.locator('#interest-rate');
    await expect(interestRate).toHaveValue('2.2');
    
    const loanTerm = page.locator('#loan-term');
    await expect(loanTerm).toHaveValue('25');
  });

  test('should calculate mortgage and display chart', async ({ page }) => {
    // Wait for the mortgage calculator to load
    await page.waitForLoadState('networkidle');
    
    // Fill in the form
    await page.fill('#loan-amount', '250000');
    await page.fill('#interest-rate', '3.5');
    await page.fill('#loan-term', '20');
    
    // Trigger calculation by changing a field and waiting
    await page.fill('#loan-amount', '250000');
    await page.waitForTimeout(1000); // Wait for debounced calculation
    
    // Check that chart container has content (D3 chart should be rendered)
    const chartContainer = page.locator('#chart-container');
    await expect(chartContainer).not.toBeEmpty();
    
    // Check that SVG chart is rendered
    const svg = chartContainer.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should toggle sidebar', async ({ page }) => {
    const sidebar = page.locator('#sidebar');
    const toggleBtn = page.locator('#sidebar-toggle');
    
    // Sidebar should start collapsed (60px width)
    await expect(sidebar).not.toHaveClass(/expanded/);
    
    // Click toggle button
    await toggleBtn.click();
    
    // Sidebar should be expanded
    await expect(sidebar).toHaveClass(/expanded/);
    
    // Click again to collapse
    await toggleBtn.click();
    
    // Sidebar should be collapsed again
    await expect(sidebar).not.toHaveClass(/expanded/);
  });

  test('should add service payment', async ({ page }) => {
    // Click the add service payment button
    await page.click('#add-service-payment-btn');
    
    // Wait for service payment inputs to appear
    await page.waitForSelector('input[placeholder*="Insurance"]', { timeout: 2000 });
    
    // Check that service payment fields are visible
    const servicePaymentsList = page.locator('#service-payments-list');
    await expect(servicePaymentsList.locator('.service-payment-item')).toHaveCount(1);
  });

  test('should open and close language modal', async ({ page }) => {
    const languageModal = page.locator('#language-modal');
    const languageBtn = page.locator('#language-menu-btn');
    
    // Modal should be hidden initially
    await expect(languageModal).toHaveClass(/hidden/);
    
    // Click language button
    await languageBtn.click();
    
    // Modal should be visible
    await expect(languageModal).not.toHaveClass(/hidden/);
    
    // Close modal
    await page.click('#close-language-modal');
    
    // Modal should be hidden again
    await expect(languageModal).toHaveClass(/hidden/);
  });

  test('should navigate to amortization page', async ({ page }) => {
    // Click the amortization link in sidebar
    await page.click('a[href="/amortization"]');
    
    // Wait for navigation
    await page.waitForURL('**/amortization');
    
    // Check that we're on the amortization page
    await expect(page.locator('h1')).toContainText('Amortization Simulation');
  });

  test('should navigate to compare page', async ({ page }) => {
    // Click the compare link in sidebar
    await page.click('a[href="/compare"]');
    
    // Wait for navigation
    await page.waitForURL('**/compare');
    
    // Check that we're on the compare page
    await expect(page.locator('h1')).toContainText('Compare Simulations');
  });

  test('should save and load simulation', async ({ page }) => {
    // Set custom values
    await page.fill('#loan-amount', '350000');
    await page.fill('#interest-rate', '2.8');
    await page.fill('#loan-term', '30');
    
    // Wait for any auto-calculation
    await page.waitForTimeout(1000);
    
    // Mark as changed to show save button
    await page.locator('#loan-amount').fill('350001');
    await page.waitForTimeout(500);
    
    // Type in simulation name
    const simulationTitleInput = page.locator('#simulation-title-input');
    await simulationTitleInput.click();
    await simulationTitleInput.fill('Test Simulation');
    
    // Click save button
    await page.click('#save-simulation-header-btn');
    
    // Wait for toast notification
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
    
    // Start a new simulation
    await page.click('#new-simulation-btn');
    
    // Open load modal
    await page.click('#load-simulation-menu-btn');
    
    // Wait for modal to be visible
    const loadModal = page.locator('#load-modal');
    await expect(loadModal).not.toHaveClass(/hidden/);
    
    // Find and click load button for "Test Simulation"
    const loadBtn = page.locator('button.load-simulation-btn[data-name="Test Simulation"]');
    await loadBtn.click();
    
    // Verify values are restored
    await expect(page.locator('#loan-amount')).toHaveValue('350001');
    await expect(page.locator('#interest-rate')).toHaveValue('2.8');
  });

  test('should validate input fields', async ({ page }) => {
    // Try to enter invalid values
    await page.fill('#loan-amount', '-1000');
    await page.fill('#interest-rate', '-5');
    await page.fill('#loan-term', '0');
    
    // Inputs should handle validation (depends on your implementation)
    // This is a basic check - adjust based on your validation logic
    const loanAmount = page.locator('#loan-amount');
    const value = await loanAmount.inputValue();
    
    // Number inputs typically prevent negative values or your JS should handle it
    // Add your specific validation checks here
  });

  test('should handle mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#loan-amount')).toBeVisible();
    
    // Sidebar should work on mobile
    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('should load simulation with service payments correctly', async ({ page }) => {
    // Add a simulation with service payments directly to localStorage
    await page.evaluate(() => {
      const simulation = {
        name: 'Test With Services',
        loanAmount: 400000,
        interestRate: 3.0,
        loanTerm: 25,
        startDate: '2025-01-01',
        servicePayments: [
          { name: 'Home Insurance', monthlyCost: 150, finishDate: '' },
          { name: 'Life Insurance', monthlyCost: 100, finishDate: '' }
        ],
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('mortgage-calculator-simulations', JSON.stringify([simulation]));
    });
    
    // Reload page to pick up the saved simulation
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Open load modal
    await page.click('#load-simulation-menu-btn');
    
    // Wait for modal to be visible
    const loadModal = page.locator('#load-modal');
    await expect(loadModal).not.toHaveClass(/hidden/);
    
    // Find and click load button for "Test With Services"
    const loadBtn = page.locator('button.load-simulation-btn[data-name="Test With Services"]');
    await loadBtn.click();
    
    // Wait for load to complete
    await page.waitForTimeout(1000);
    
    // Verify basic mortgage values are loaded
    await expect(page.locator('#loan-amount')).toHaveValue('400000');
    await expect(page.locator('#interest-rate')).toHaveValue('3');
    await expect(page.locator('#loan-term')).toHaveValue('25');
    
    // Verify service payments are displayed
    const servicePaymentsList = page.locator('#service-payments-list');
    const serviceItems = servicePaymentsList.locator('.service-payment-item, .service-payment-row');
    
    // Should have 2 service payments
    await expect(serviceItems).toHaveCount(2);
    
    // Verify the service payment values are loaded correctly
    const firstServiceName = servicePaymentsList.locator('.service-name').first();
    const firstServiceCost = servicePaymentsList.locator('.service-cost').first();
    
    await expect(firstServiceName).toHaveValue('Home Insurance');
    await expect(firstServiceCost).toHaveValue('150');
  });

  test('should display simulation values in load modal correctly', async ({ page }) => {
    // Add simulations in both old and new formats
    await page.evaluate(() => {
      const simulations = [
        // Old format
        {
          name: 'Old Format Sim',
          loanAmount: 350000,
          interestRate: 2.5,
          loanTerm: 30,
          startDate: '2024-01-01',
          servicePayments: [],
          savedAt: new Date().toISOString()
        },
        // New format
        {
          name: 'New Format Sim',
          mortgageSimulation: {
            loanAmount: 450000,
            interestRate: 3.2,
            loanTerm: 20,
            startDate: '2025-01-01',
            servicePayments: []
          },
          savedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('mortgage-calculator-simulations', JSON.stringify(simulations));
    });
    
    // Reload page to pick up the saved simulations
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Open load modal
    await page.click('#load-simulation-menu-btn');
    
    // Wait for modal to be visible
    const loadModal = page.locator('#load-modal');
    await expect(loadModal).not.toHaveClass(/hidden/);
    
    // Check old format simulation displays correctly
    const oldSimItem = page.locator('.simulation-item[data-name="Old Format Sim"]');
    await expect(oldSimItem).toBeVisible();
    const oldSimDetails = oldSimItem.locator('.simulation-details');
    await expect(oldSimDetails).toContainText('€350,000');
    await expect(oldSimDetails).toContainText('2.5%');
    await expect(oldSimDetails).toContainText('30y');
    
    // Check new format simulation displays correctly
    const newSimItem = page.locator('.simulation-item[data-name="New Format Sim"]');
    await expect(newSimItem).toBeVisible();
    const newSimDetails = newSimItem.locator('.simulation-details');
    await expect(newSimDetails).toContainText('€450,000');
    await expect(newSimDetails).toContainText('3.2%');
    await expect(newSimDetails).toContainText('20y');
  });
});

