/**
 * Simple Example Test
 * 
 * This is a basic test to verify Playwright is working correctly.
 * Run with: npm test tests/example.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Example Tests - Getting Started', () => {
  
  test('example 1: basic navigation', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Check page loaded
    await expect(page).toHaveTitle(/Mortgage Amortization Calculator/);
    console.log('✅ Page loaded successfully');
  });

  test('example 2: finding elements', async ({ page }) => {
    await page.goto('/');
    
    // Find elements by ID
    const loanAmount = page.locator('#loan-amount');
    await expect(loanAmount).toBeVisible();
    
    // Find elements by text
    const heading = page.locator('text=Mortgage Amortization Calculator');
    await expect(heading).toBeVisible();
    
    console.log('✅ Elements found successfully');
  });

  test('example 3: interacting with forms', async ({ page }) => {
    await page.goto('/');
    
    // Fill in a form field
    await page.fill('#loan-amount', '400000');
    
    // Verify the value was set
    await expect(page.locator('#loan-amount')).toHaveValue('400000');
    
    console.log('✅ Form interaction successful');
  });

  test('example 4: clicking buttons', async ({ page }) => {
    await page.goto('/');
    
    // Click the sidebar toggle
    const toggleBtn = page.locator('#sidebar-toggle');
    await toggleBtn.click();
    
    // Check sidebar expanded
    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toHaveClass(/expanded/);
    
    console.log('✅ Button click successful');
  });

  test('example 5: waiting for elements', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for specific element
    await page.waitForSelector('#loan-amount');
    
    console.log('✅ Wait operations successful');
  });

  test('example 6: taking screenshots', async ({ page }) => {
    await page.goto('/');
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'test-results/example-screenshot.png' 
    });
    
    console.log('✅ Screenshot saved to test-results/example-screenshot.png');
  });

  test('example 7: extracting data', async ({ page }) => {
    await page.goto('/');
    
    // Get text content
    const title = await page.locator('h1').textContent();
    console.log('Page title:', title);
    
    // Get input value
    const loanAmount = await page.inputValue('#loan-amount');
    console.log('Default loan amount:', loanAmount);
    
    // Get attribute
    const placeholder = await page.locator('#loan-amount').getAttribute('placeholder');
    console.log('Placeholder:', placeholder);
    
    console.log('✅ Data extraction successful');
  });

  test('example 8: navigation between pages', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to amortization page
    await page.click('a[href="/amortization"]');
    await page.waitForURL('**/amortization');
    
    // Verify we're on the right page
    await expect(page.locator('h1')).toContainText('Amortization');
    
    console.log('✅ Navigation successful');
  });

  test('example 9: multiple assertions', async ({ page }) => {
    await page.goto('/');
    
    // Multiple checks at once
    await expect(page.locator('#loan-amount')).toBeVisible();
    await expect(page.locator('#interest-rate')).toBeVisible();
    await expect(page.locator('#loan-term')).toBeVisible();
    await expect(page.locator('#start-date')).toBeVisible();
    
    console.log('✅ All mortgage fields are visible');
  });

  test('example 10: working with localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Set data in localStorage
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    
    // Read data from localStorage
    const value = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(value).toBe('test-value');
    console.log('✅ localStorage operations successful');
    
    // Clean up
    await page.evaluate(() => localStorage.clear());
  });

});

/**
 * Tips for writing tests:
 * 
 * 1. Always use await with async operations
 * 2. Use expect() for assertions
 * 3. Use specific selectors (IDs are best)
 * 4. Wait for conditions, not timeouts
 * 5. Keep tests independent
 * 6. Clean up test data
 * 
 * Common selectors:
 * - By ID: page.locator('#element-id')
 * - By class: page.locator('.class-name')
 * - By text: page.locator('text=Button Text')
 * - By attribute: page.locator('[data-testid="value"]')
 * 
 * Common actions:
 * - Click: await page.click('#button')
 * - Fill: await page.fill('#input', 'value')
 * - Type: await page.type('#input', 'value')
 * - Select: await page.selectOption('#select', 'option')
 * 
 * Common assertions:
 * - await expect(element).toBeVisible()
 * - await expect(element).toHaveText('text')
 * - await expect(element).toHaveValue('value')
 * - await expect(element).toHaveCount(3)
 */

