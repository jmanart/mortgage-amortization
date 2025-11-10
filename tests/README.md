# Playwright Tests

This directory contains automated tests for the Mortgage Amortization Calculator.

## Test Files

### `mortgage-calculator.spec.ts`
Tests for the main mortgage calculator page (`/`):
- Loading with default values
- Calculating mortgage payments
- Adding service payments
- Saving and loading simulations
- Sidebar navigation
- Mobile responsiveness

### `amortization.spec.ts`
Tests for the amortization simulation page (`/amortization`):
- Adding one-off amortization payments
- Adding periodic amortization payments
- Clearing payments
- Saving amortization simulations

### `compare.spec.ts`
Tests for the compare simulations page (`/compare`):
- Displaying saved simulations
- Expanding/collapsing simulation details
- Handling multiple simulations
- Service payments display
- Navigation to load simulations

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/mortgage-calculator.spec.ts

# Run in headed mode (see browser)
npm run test:headed

# Run in UI mode (interactive)
npm run test:ui

# Run in debug mode
npm run test:debug

# Run specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

## Writing New Tests

Create a new file in this directory:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Your test code
  });
});
```

## Test Structure

Each test follows the AAA pattern:
- **Arrange**: Set up test data and navigate to page
- **Act**: Perform actions (click, fill, etc.)
- **Assert**: Verify expected outcomes

Example:

```typescript
test('should calculate mortgage', async ({ page }) => {
  // Arrange
  await page.goto('/');
  
  // Act
  await page.fill('#loan-amount', '300000');
  await page.fill('#interest-rate', '2.5');
  await page.fill('#loan-term', '25');
  
  // Assert
  await expect(page.locator('#chart-container svg')).toBeVisible();
});
```

## Best Practices

1. **Use descriptive test names**: Tests should describe what they verify
2. **Keep tests independent**: Each test should work on its own
3. **Clean up after tests**: Clear localStorage, cookies, etc.
4. **Wait for conditions**: Use `waitForSelector`, not `waitForTimeout`
5. **Use page objects**: Extract complex interactions into reusable classes

## Debugging Tests

### Debug Mode
```bash
npm run test:debug
```

### Trace Viewer
After a test fails, view the trace:
```bash
npx playwright show-trace test-results/trace.zip
```

### Console Output
Add console logs in tests:
```typescript
console.log('Current URL:', page.url());
const value = await page.inputValue('#loan-amount');
console.log('Loan amount:', value);
```

### Screenshots
Take screenshots during tests:
```typescript
await page.screenshot({ path: 'debug-screenshot.png' });
```

## Continuous Integration

Tests are configured to run automatically in CI/CD. See `.github/workflows/playwright.yml` for setup.

## Coverage

Run tests and check code coverage:
```bash
npm test
```

View report:
```bash
npm run test:report
```

## Adding Test Data

For tests requiring saved simulations, add data in `beforeEach`:

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const simulation = {
      name: 'Test Simulation',
      loanAmount: 300000,
      interestRate: 2.5,
      loanTerm: 25,
      servicePayments: [],
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('mortgage-calculator-simulations', JSON.stringify([simulation]));
  });
  await page.reload();
});
```

## Troubleshooting

### Tests fail with "Target page closed"
The page navigated before the action completed. Use `Promise.all`:
```typescript
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/page"]')
]);
```

### Tests fail with "Element not visible"
Wait for element to be visible:
```typescript
await page.waitForSelector('#element-id', { state: 'visible' });
```

### Tests timeout
Increase timeout in test:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // test code
});
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Project Guide](../PLAYWRIGHT_GUIDE.md)
- [Configuration](../playwright.config.ts)

