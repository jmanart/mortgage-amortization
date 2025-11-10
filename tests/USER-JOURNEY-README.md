# E2E User Journey Test Suite

This comprehensive test suite covers realistic user scenarios for comparing mortgage offers from different banks. The tests are written from the perspective of a user evaluating multiple offers to find the best value.

## 📋 Overview

The test suite simulates a real user journey where someone:
1. Receives multiple mortgage offers from different banks
2. Enters each offer with its specific terms, rates, and bundled services
3. Compares offers side-by-side
4. Evaluates different scenarios (early repayment, extra payments, etc.)
5. Makes a final decision based on total cost

## 🗂️ Test Categories

### Category 1: Initial Offer Entry & Basic Comparison
**File:** `user-journey-basic-comparison.spec.ts`

Tests the fundamental workflow of entering and comparing mortgage offers.

- **Scenario 1.1:** Enter first bank offer with basic details
- **Scenario 1.2:** Enter competing offers from multiple banks
- **Scenario 1.3:** Quick comparison view of all offers

### Category 2: Service Costs & Bundled Offers
**File:** `user-journey-service-costs.spec.ts`

Tests different service payment configurations (insurance, fees, etc.).

- **Scenario 2.1:** Bank with mandatory insurance packages
- **Scenario 2.2:** Mixed service duration scenarios
- **Scenario 2.3:** Multiple service configurations (none, basic, premium)

### Category 3: Interest Rate Variations & Impact Analysis
**File:** `user-journey-interest-rate-variations.spec.ts`

Tests how different interest rates affect total cost.

- **Scenario 3.1:** Fixed vs variable rate comparison
- **Scenario 3.2:** Rate differential impact (incremental rate changes)
- **Scenario 3.3:** Sweet spot analysis (short/high vs long/low)
- **Scenario 3.4:** Micro rate differences for precision testing

### Category 4: Early Repayment & Amortization Strategies
**File:** `user-journey-early-repayment.spec.ts`

Tests early repayment scenarios and their impact.

- **Scenario 4.1:** One-time windfall payment
- **Scenario 4.2:** Regular extra payments
- **Scenario 4.3:** Penalty comparison across banks
- **Scenario 4.4:** Mixed amortization strategy

### Category 5: Real-World Bank Offer Comparisons
**File:** `user-journey-real-world-offers.spec.ts`

Tests complete, realistic bank offer scenarios.

- **Scenario 5.1:** Premium package offer (high services, good rate)
- **Scenario 5.2:** Economy package offer (minimal services, higher rate)
- **Scenario 5.3:** Flexible package offer (no services, medium rate)
- **Scenario 5.4:** Side-by-side comparison of all offers
- **Scenario 5.5:** Identify best value based on comparison

### Category 6: Edge Cases & Data Integrity
**File:** `user-journey-edge-cases.spec.ts`

Tests system reliability and edge cases.

- **Scenario 6.1:** Maximum capacity test (10+ simulations)
- **Scenario 6.2:** Simulation management (rename, delete)
- **Scenario 6.3:** Load and modify workflow
- **Scenario 6.4:** Browser session persistence
- **Scenario 6.5:** Concurrent modification handling
- **Scenario 6.6:** Large numbers handling

### Category 7: Multi-Language Support
**File:** `user-journey-multi-language.spec.ts`

Tests language switching and data integrity across languages.

- **Scenario 7.1:** Language switch during comparison
- **Scenario 7.2:** Create simulation in different language
- **Scenario 7.3:** Language persistence across sessions
- **Scenario 7.4:** Special characters in simulation names
- **Scenario 7.5:** Number formatting across locales

### Category 8: Mobile & Responsive Comparison Flow
**File:** `user-journey-mobile-responsive.spec.ts`

Tests mobile viewports and cross-device workflows.

- **Scenario 8.1:** Mobile offer entry
- **Scenario 8.2:** Mobile comparison view
- **Scenario 8.3:** Cross-device workflow
- **Scenario 8.4:** Tablet viewport
- **Scenario 8.5:** Orientation change (portrait to landscape)
- **Scenario 8.6:** Touch interactions
- **Scenario 8.7:** Sidebar on mobile

### Category 9: Decision-Making Workflow (Complete User Journey)
**File:** `user-journey-complete-flow.spec.ts`

Tests end-to-end workflows from initial entry to final decision.

- **Scenario 9.1:** Full comparison journey (15+ minute user flow)
- **Scenario 9.2:** Iterative refinement
- **Scenario 9.3:** What-if analysis
- **Scenario 9.4:** Time-constrained decision making

### Category 10: Error Handling & Validation
**File:** `user-journey-error-handling.spec.ts`

Tests input validation, error cases, and system resilience.

- **Scenario 10.1:** Invalid input handling
- **Scenario 10.2:** Duplicate names
- **Scenario 10.3:** Corrupted data recovery
- **Scenario 10.4:** Extreme values
- **Scenario 10.5:** Empty fields handling
- **Scenario 10.6:** Special characters in inputs
- **Scenario 10.7:** Rapid successive actions
- **Scenario 10.8:** LocalStorage quota exceeded

## 🚀 Running the Tests

### Run All User Journey Tests
```bash
npm test tests/user-journey-*.spec.ts
```

### Run Specific Category
```bash
# Basic comparison
npm test tests/user-journey-basic-comparison.spec.ts

# Service costs
npm test tests/user-journey-service-costs.spec.ts

# Interest rate variations
npm test tests/user-journey-interest-rate-variations.spec.ts

# Early repayment
npm test tests/user-journey-early-repayment.spec.ts

# Real-world offers
npm test tests/user-journey-real-world-offers.spec.ts

# Edge cases
npm test tests/user-journey-edge-cases.spec.ts

# Multi-language
npm test tests/user-journey-multi-language.spec.ts

# Mobile responsive
npm test tests/user-journey-mobile-responsive.spec.ts

# Complete flow
npm test tests/user-journey-complete-flow.spec.ts

# Error handling
npm test tests/user-journey-error-handling.spec.ts
```

### Run in UI Mode (Recommended for Development)
```bash
npm run test:ui
```

### Run in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Run in Debug Mode
```bash
npm run test:debug
```

## 📊 Test Execution Priority

### P0 (Critical) - Run First
Essential user workflows that must work:
- Category 1: Basic comparison (Scenarios 1.1-1.3)
- Category 2: Service costs (Scenarios 2.1-2.3)
- Category 5: Real-world offers (Scenarios 5.1-5.4)
- Category 9: Complete flow (Scenario 9.1)

```bash
npm test tests/user-journey-basic-comparison.spec.ts
npm test tests/user-journey-service-costs.spec.ts
npm test tests/user-journey-real-world-offers.spec.ts
npm test tests/user-journey-complete-flow.spec.ts -- --grep "Scenario 9.1"
```

### P1 (High) - Core Functionality
Important features that enhance decision-making:
- Category 3: Interest rate variations (Scenarios 3.1-3.3)
- Category 4: Early repayment (Scenarios 4.1-4.3)
- Category 6: Edge cases (Scenarios 6.1-6.4)

```bash
npm test tests/user-journey-interest-rate-variations.spec.ts
npm test tests/user-journey-early-repayment.spec.ts
npm test tests/user-journey-edge-cases.spec.ts
```

### P2 (Medium) - Enhanced Experience
Features that improve usability:
- Category 7: Multi-language (Scenarios 7.1-7.2)
- Category 8: Mobile responsive (Scenarios 8.1-8.3)
- Category 9: Iterative refinement (Scenarios 9.2-9.3)

```bash
npm test tests/user-journey-multi-language.spec.ts
npm test tests/user-journey-mobile-responsive.spec.ts
```

### P3 (Low) - Edge Cases & Validation
Error handling and edge cases:
- Category 10: Error handling (Scenarios 10.1-10.3)

```bash
npm test tests/user-journey-error-handling.spec.ts
```

## 🎯 Key Metrics Verified

Each test verifies:
- ✅ **Total payment calculation accuracy** - Ensures correct mortgage calculations
- ✅ **Service cost integration** - Verifies additional costs are properly included
- ✅ **Amortization payment impact** - Confirms early payments reduce total cost
- ✅ **Penalty calculations** - Validates early repayment penalty math
- ✅ **Data persistence** - Ensures simulations survive browser refresh
- ✅ **UI responsiveness** - Tests performance with multiple simulations
- ✅ **Cross-language integrity** - Verifies data works across all languages
- ✅ **Mobile usability** - Confirms functionality on small screens

## 💡 Test Writing Guidelines

### Helper Functions
Each test file includes helper functions to reduce duplication:

```typescript
// Create and save a simulation
async function createAndSaveSimulation(page, name, amount, rate, term) { ... }

// Add service payment
async function addServicePayment(page, name, cost) { ... }

// Quick simulation creation
async function quickCreateSimulation(page, name, amount, rate, term) { ... }
```

### Common Patterns

**Creating a Basic Simulation:**
```typescript
await page.fill('#loan-amount', '300000');
await page.fill('#interest-rate', '2.5');
await page.fill('#loan-term', '25');
await page.waitForTimeout(1000);

const titleInput = page.locator('#simulation-title-input');
await titleInput.click();
await titleInput.fill('My Simulation');

await page.waitForSelector('#save-simulation-header-btn', { state: 'visible' });
await page.click('#save-simulation-header-btn');
await expect(page.locator('.toast.success')).toBeVisible({ timeout: 3000 });
```

**Navigating to Compare Page:**
```typescript
await page.goto('/compare');
await page.waitForLoadState('networkidle');

const tableBody = page.locator('#simulations-table-body');
await expect(tableBody).toContainText('My Simulation');
```

**Expanding Simulation Details:**
```typescript
await page.click('.expand-btn[data-name="My Simulation"]');
const detailsRow = page.locator('.simulation-details-row[data-name="My Simulation"]');
await expect(detailsRow).not.toHaveClass(/hidden/);
```

## 🐛 Debugging Tests

### Using Playwright Inspector
```bash
npm run test:debug tests/user-journey-basic-comparison.spec.ts
```

### Visual Debugging with Trace Viewer
```bash
npm test -- --trace on
npm run test:report
```

### Screenshots on Failure
All tests automatically capture screenshots on failure. Find them in:
```
test-results/
```

### Slow Motion for Observation
Add to specific tests:
```typescript
test.use({ slowMo: 500 });
```

## 📝 Adding New Test Scenarios

When adding new scenarios:

1. **Choose the Right Category** - Add to existing file or create new category
2. **Follow Naming Convention** - `Scenario X.Y: Description`
3. **Use Helper Functions** - Reduce code duplication
4. **Add Clear Comments** - Explain what user is trying to achieve
5. **Verify Key Metrics** - Check calculations and data persistence
6. **Update This README** - Document new scenarios

Example:
```typescript
test('Scenario X.Y: Description of User Goal', async ({ page }) => {
  // Setup
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  // User action
  await createSimulation(...);

  // Verification
  await expect(...).toBeVisible();
});
```

## 🔄 Continuous Integration

### Running in CI/CD
```bash
# Run all tests headlessly
npm test

# Generate HTML report
npm run test:report
```

### Parallel Execution
Playwright runs tests in parallel by default. Configure in `playwright.config.ts`:
```typescript
workers: process.env.CI ? 2 : 4
```

## 📚 Related Documentation

- **Main README:** `../README.md` - Project overview
- **Playwright Guide:** `../PLAYWRIGHT_GUIDE.md` - Detailed Playwright usage
- **Test Examples:** `./README.md` - Basic test examples
- **Roadmap:** `../e2e-testing-roadmap.plan.md` - Detailed test plan

## 🤝 Contributing

When contributing new test scenarios:

1. Ensure tests follow the user journey pattern
2. Add helper functions for common operations
3. Update this README with new scenarios
4. Maintain consistency with existing test structure
5. Verify tests pass locally before submitting

## ✅ Test Coverage Summary

- **Total Scenarios:** 50+
- **Test Categories:** 10
- **User Flows:** Complete mortgage comparison journey
- **Browser Coverage:** Chromium, Firefox, WebKit
- **Device Coverage:** Desktop, Mobile, Tablet
- **Language Coverage:** English, French, Spanish

---

**Last Updated:** October 2025
**Maintained By:** Development Team

