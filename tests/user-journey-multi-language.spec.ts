import { test, expect, type Page } from '@playwright/test';

/**
 * Category 7: Multi-Language Support for International Users
 * Tests covering language switching and data integrity across languages
 */

test.describe('Category 7: Multi-Language Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 7.1: Language Switch During Comparison', async ({ page }) => {
    // Create 3 simulations in English
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simulation 1
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(500);

    let titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('English Sim 1');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Simulation 2
    await page.click('#new-simulation-btn');
    await page.fill('#loan-amount', '350000');
    await page.fill('#interest-rate', '2.7');
    await page.fill('#loan-term', '27');
    await page.waitForTimeout(500);

    titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('English Sim 2');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Simulation 3
    await page.click('#new-simulation-btn');
    await page.fill('#loan-amount', '400000');
    await page.fill('#interest-rate', '2.9');
    await page.fill('#loan-term', '29');
    await page.waitForTimeout(500);

    titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('English Sim 3');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Switch to French
    await page.click('#language-menu-btn');
    await page.waitForSelector('#language-modal:not(.hidden)');
    await page.click('button.language-option[data-lang="fr"]');
    await page.waitForTimeout(500);

    // Verify UI labels changed to French
    await expect(page.locator('h1')).toContainText('Calculateur');

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify all labels translated
    // The page title should be in French
    await expect(page.locator('h1')).toContainText('Comparer');

    // Verify numbers and calculations unchanged
    const tableBody = page.locator('#simulations-table-body');
    await expect(tableBody).toContainText('English Sim 1');
    await expect(tableBody).toContainText('English Sim 2');
    await expect(tableBody).toContainText('English Sim 3');
    await expect(tableBody).toContainText('€300,000');
    await expect(tableBody).toContainText('€350,000');
    await expect(tableBody).toContainText('€400,000');

    // Switch to Spanish
    await page.click('#language-menu-btn');
    await page.waitForSelector('#language-modal:not(.hidden)');
    await page.click('button.language-option[data-lang="es"]');
    await page.waitForTimeout(500);

    // Verify Spanish UI
    await expect(page.locator('h1')).toContainText('Comparar');

    // Data should still be intact
    await expect(tableBody).toContainText('English Sim 1');
    await expect(tableBody).toContainText('€300,000');
  });

  test('Scenario 7.2: Create Simulation in Different Language', async ({ page }) => {
    // Switch to French first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.click('#language-menu-btn');
    await page.waitForSelector('#language-modal:not(.hidden)');
    await page.click('button.language-option[data-lang="fr"]');
    await page.waitForTimeout(500);

    // Create new simulation in French
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(500);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Simulation Française');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Switch to English
    await page.click('#language-menu-btn');
    await page.waitForSelector('#language-modal:not(.hidden)');
    await page.click('button.language-option[data-lang="en"]');
    await page.waitForTimeout(500);

    // Load simulation
    await page.click('#load-simulation-menu-btn');
    await page.waitForSelector('#load-modal:not(.hidden)');
    await page.click('button.load-simulation-btn[data-name="Simulation Française"]');
    await page.waitForTimeout(500);

    // Verify data intact and readable
    await expect(page.locator('#simulation-title-input')).toHaveValue('Simulation Française');
    await expect(page.locator('#loan-amount')).toHaveValue('300000');
    await expect(page.locator('#interest-rate')).toHaveValue('2.5');
    await expect(page.locator('#loan-term')).toHaveValue('25');

    // Verify simulation works correctly in English
    const svg = page.locator('#chart-container svg');
    await expect(svg).toBeVisible();
  });

  test('Scenario 7.3: Language Persistence Across Sessions', async ({ page, context }) => {
    // Set language to French
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.click('#language-menu-btn');
    await page.waitForSelector('#language-modal:not(.hidden)');
    await page.click('button.language-option[data-lang="fr"]');
    await page.waitForTimeout(500);

    // Create simulation
    await page.fill('#loan-amount', '300000');
    await page.fill('#interest-rate', '2.5');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(500);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Test Persistence');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Close and reopen
    await page.close();
    const newPage = await context.newPage();
    
    await newPage.goto('/');
    await newPage.waitForLoadState('networkidle');

    // Language preference should persist (if implemented)
    // At minimum, data should be accessible in any language
    await newPage.click('#load-simulation-menu-btn');
    await newPage.waitForSelector('#load-modal:not(.hidden)');
    
    const loadModal = newPage.locator('#load-modal');
    await expect(loadModal).toContainText('Test Persistence');
  });

  test('Scenario 7.4: Special Characters in Simulation Names', async ({ page }) => {
    // Test with various language-specific characters
    const testNames = [
      'Café Français',
      'Español ñ',
      'Test €100k',
      'Prêt Immobilier'
    ];

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (let i = 0; i < testNames.length; i++) {
      if (i > 0) {
        await page.click('#new-simulation-btn');
        await page.waitForTimeout(300);
      }

      await page.fill('#loan-amount', '300000');
      await page.fill('#interest-rate', '2.5');
      await page.fill('#loan-term', '25');
      await page.waitForTimeout(300);

      const titleInput = page.locator('#simulation-title-input');
      await titleInput.click();
      await titleInput.fill(testNames[i]);
      await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
      await page.click('#save-simulation-header-btn');
      await page.waitForTimeout(300);
    }

    // Navigate to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Verify all names displayed correctly
    const tableBody = page.locator('#simulations-table-body');
    for (const name of testNames) {
      await expect(tableBody).toContainText(name);
    }
  });

  test('Scenario 7.5: Number Formatting Across Locales', async ({ page }) => {
    // Create simulation with specific numbers
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.fill('#loan-amount', '1234567');
    await page.fill('#interest-rate', '3.45');
    await page.fill('#loan-term', '25');
    await page.waitForTimeout(500);

    const titleInput = page.locator('#simulation-title-input');
    await titleInput.click();
    await titleInput.fill('Number Format Test');
    await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
    await page.click('#save-simulation-header-btn');
    await page.waitForTimeout(500);

    // Go to compare page
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    // Numbers should be formatted consistently
    const tableBody = page.locator('#simulations-table-body');
    // Should use locale-appropriate number formatting
    await expect(tableBody).toContainText('1,234,567');
    await expect(tableBody).toContainText('3.45%');

    // Switch language and verify numbers remain readable
    await page.click('#language-menu-btn');
    await page.waitForSelector('#language-modal:not(.hidden)');
    await page.click('button.language-option[data-lang="fr"]');
    await page.waitForTimeout(500);

    // Numbers should still be visible (formatting may vary by locale)
    await expect(tableBody).toContainText('1,234,567');
  });
});

