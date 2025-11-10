import { test, expect, type Page } from '@playwright/test';

/**
 * Category 8: Mobile & Responsive Comparison Flow
 * Tests covering mobile viewports and cross-device workflows
 */

test.describe('Category 8: Mobile & Responsive Comparison Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 8.1: Mobile Offer Entry', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page loads on mobile
    await expect(page.locator('h1')).toBeVisible();
    
    // Fill in mortgage details
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');

    // Add service payment
    await page.click('#add-service-payment-btn');
    await page.waitForTimeout(300);

    const serviceItem = page.locator('.service-payment-item').last();
    await serviceItem.locator('input').first().fill('Mobile Insurance');
    await serviceItem.locator('input[type="number"]').fill('50');

    await page.waitForTimeout(500);

    // Verify form usability on small screen
    await expect(page.locator('#loan-amount')).toBeVisible();
    await expect(page.locator('#interest-rate')).toBeVisible();

    // Save simulation
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Mobile Offer');

    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible', timeout: 3000 });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Verify saved
    const simulations = await page.evaluate(() => {
      const stored = localStorage.getItem('mortgage-calculator-simulations');
      return stored ? JSON.parse(stored) : [];
    });

    expect(simulations).toHaveLength(1);
    expect(simulations[0].name).toBe('Mobile Offer');
  });

  test('Scenario 8.2: Mobile Comparison View', async ({ page }) => {
    // Create simulations on desktop first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create 3 simulations
    for (let i = 1; i <= 3; i++) {
      if (i > 1) {
        await page.click('#new-simulation-btn');
        await page.waitForTimeout(300);
      }

      await page.fill('#loan-amount', `${250000 + (i * 50000)}`);
      await page.fill('#interest-rate', `${2.0 + (i * 0.3)}`);
      await page.fill('#loan-term', `${20 + (i * 3)}`);
      await page.waitForTimeout(300);

      const titleInput = page.locator('#simulation-title-input');
      await titleInput.click();
      await titleInput.fill(`Offer ${i}`);
      await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
      await page.click('#save-simulation-header-btn');
      await page.waitForTimeout(300);
    }

    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify table responsive/scrollable
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toBeVisible();

    // All offers should be present
    await expect(tableBody).toContainText('Offer 1');
    await expect(tableBody).toContainText('Offer 2');
    await expect(tableBody).toContainText('Offer 3');

    // Expand simulation details
    await page.click('.expand-btn[data-name="Offer 1"]');
    const detailsRow = page.locator('.simulation-details-row[data-name="Offer 1"]');
    
    // Verify readability and interaction on mobile
    await expect(detailsRow).not.toHaveClass(/hidden/);
    await expect(detailsRow).toBeVisible();

    // Test horizontal scrolling if needed
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('Scenario 8.3: Cross-Device Workflow', async ({ page, context }) => {
    // Create simulations on desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create 2 simulations
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(300);

    let titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Desktop Sim 1');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(300);

    await page.click('#new-simulation-btn');
    await page.fill('#loan-amount', '350000');
    await page.fill('#interest-rate', '2.7');
    await page.fill('#loan-term', '27');
    await page.waitForTimeout(300);

    titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Desktop Sim 2');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(300);

    // Switch to mobile viewport (simulating switching to mobile device)
    await page.setViewportSize({ width: 375, height: 667 });

    // Access compare page on mobile
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify same data available
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Desktop Sim 1');
    await expect(tableBody).toContainText('Desktop Sim 2');

    // Load simulation on mobile to view details
    await page.click('.expand-btn[data-name="Desktop Sim 1"]');
    await page.click('a.load-simulation-link');
    await page.waitForURL('**/');

    // Verify simulation loads correctly on mobile
    await expect(page.locator('#simulation-title-input')).toHaveValue('Desktop Sim 1');
    await expect(page.locator('#loan-amount')).toHaveValue('300000');

    // Verify chart renders on mobile
    const svg = page.locator('#chart-container svg');
    await expect(svg).toBeVisible();
  });

  test('Scenario 8.4: Tablet Viewport', async ({ page }) => {
    // Test tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create simulation on tablet
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(300);

    // Add service payment
    await page.click('#add-service-payment-btn');
    await page.waitForTimeout(300);

    const serviceItem = page.locator('.service-payment-item').last();
    await serviceItem.locator('input').first().fill('Tablet Test');
    await serviceItem.locator('input[type="number"]').fill('60');

    await page.waitForTimeout(500);

    // Save
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Tablet Simulation');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify table displays well on tablet
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Tablet Simulation');

    // Expand and verify details readable
    await page.click('.expand-btn[data-name="Tablet Simulation"]');
    const detailsRow = page.locator('.simulation-details-row[data-name="Tablet Simulation"]');
    await expect(detailsRow).toContainText('Tablet Test');
  });

  test('Scenario 8.5: Orientation Change (Portrait to Landscape)', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(300);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Orientation Test');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(300);

    // Change to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify data displays correctly in landscape
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('Orientation Test');

    // Table should be more readable in landscape
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('Scenario 8.6: Touch Interactions', async ({ page }) => {
    // Simulate mobile with touch
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create simulation
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(300);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.tap();
    await titleInput.fill('Touch Test');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.locator('#save-simulation-header-btn').tap();
    await page.waitForTimeout(300);

    // Navigate to compare using touch
    await page.locator('a[href="/compare"]').tap();
    await page.waitForURL('**/compare');

    // Tap to expand details
    await page.locator('.expand-btn[data-name="Touch Test"]').tap();
    const detailsRow = page.locator('.simulation-details-row[data-name="Touch Test"]');
    await expect(detailsRow).not.toHaveClass(/hidden/);

    // Verify touch-friendly interactions
    await expect(page.locator('#simulations-table-body')).toContainText('Touch Test');
  });

  test('Scenario 8.7: Sidebar on Mobile', async ({ page }) => {
    // Test sidebar behavior on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Sidebar should be accessible
    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toBeVisible();

    // Toggle sidebar
    const toggleBtn = page.locator('#sidebar-toggle');
    await toggleBtn.click();
    await page.waitForTimeout(300);

    // Sidebar should expand
    await expect(sidebar).toHaveClass(/expanded/);

    // Navigation should work
    await page.click('a[href="/compare"]');
    await page.waitForURL('**/compare');
    
    await expect(page.locator('h1')).toContainText('Compare');
  });
});

