import { test, expect } from '@playwright/test';

test.describe('Amortization Simulation Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/amortization');
  });

  test('should load amortization page', async ({ page }) => {
    await expect(page).toHaveTitle(/Amortization Simulation/);
    await expect(page.locator('h1')).toContainText('Amortization Simulation');
  });

  test('should add one-off amortization payment', async ({ page }) => {
    const addButton = page.locator('#add-amortization-btn');
    await addButton.click();
    
    // Check that a payment entry was added
    const paymentsList = page.locator('#amortization-payments-list');
    await expect(paymentsList.locator('.amortization-payment-item')).toHaveCount(1);
  });

  test('should add periodic amortization payment', async ({ page }) => {
    // Fill in periodic payment fields
    await page.fill('#periodic-amount', '1000');
    await page.fill('#periodic-interval', '6');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '120');
    
    // Click add button
    await page.click('#add-periodic-payment-btn');
    
    // Check that payment was added to the list
    const periodicList = page.locator('#periodic-payments-list');
    await expect(periodicList).toContainText('1000');
    await expect(periodicList).toContainText('6');
  });

  test('should clear all periodic payments', async ({ page }) => {
    // Add a periodic payment first
    await page.fill('#periodic-amount', '500');
    await page.fill('#periodic-interval', '3');
    await page.fill('#periodic-start', '6');
    await page.fill('#periodic-end', '60');
    await page.click('#add-periodic-payment-btn');
    
    // Verify it was added
    const periodicList = page.locator('#periodic-payments-list');
    await expect(periodicList).toContainText('500');
    
    // Click clear all
    await page.click('#clear-periodic-payments-btn');
    
    // Verify list is empty
    await expect(periodicList).toBeEmpty();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.click('a[href="/"]');
    await page.waitForURL('**/');
    await expect(page.locator('h1')).toContainText('Mortgage');
  });

  test('should save amortization simulation', async ({ page }) => {
    // Add an amortization payment
    await page.click('#add-amortization-btn');
    await page.waitForTimeout(500);
    
    // Enter simulation name
    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Amortization Test');
    
    // Wait for save button to appear
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    
    // Save simulation
    await page.click('#save-simulation-header-btn');
    
    // Check for success toast
    await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
  });

  test('should show download button when payments are added', async ({ page }) => {
    // Initially, download button should not be visible
    const downloadBtn = page.locator('#download-spreadsheet-btn');
    await expect(downloadBtn).toBeHidden();
    
    // Add a periodic payment
    await page.fill('#periodic-amount', '1000');
    await page.fill('#periodic-interval', '6');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '120');
    await page.click('#add-periodic-payment-btn');
    
    // Now the download button should be visible
    await expect(downloadBtn).toBeVisible();
  });

  test('should trigger download when download button is clicked', async ({ page }) => {
    // Add a periodic payment first
    await page.fill('#periodic-amount', '1000');
    await page.fill('#periodic-interval', '6');
    await page.fill('#periodic-start', '12');
    await page.fill('#periodic-end', '120');
    await page.click('#add-periodic-payment-btn');
    
    // Wait for download button to be visible
    const downloadBtn = page.locator('#download-spreadsheet-btn');
    await expect(downloadBtn).toBeVisible();
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click download button
    await downloadBtn.click();
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download has started
    expect(download).toBeTruthy();
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });
});

