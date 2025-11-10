# Amortization Types in the Mortgage Calculator

This document explains the different types of amortization features that have been implemented in the mortgage calculator, extending beyond the basic French amortization system.

## Overview

The mortgage calculator supports multiple types of amortization strategies to help borrowers understand how different payment approaches can affect their loan payoff timeline and total interest paid.

## 1. Standard French Amortization

The foundation of the calculator is the **French amortization system** (also known as the constant payment system), which features:

- **Fixed monthly payments** throughout the loan term
- **Decreasing interest portion** over time
- **Increasing principal portion** over time
- **Mathematical formula**: A = P × i / (1 - (1 + i)^(-n))

Where:
- A = Fixed monthly payment
- P = Principal loan amount
- i = Monthly interest rate (annual rate ÷ 12)
- n = Total number of payments

## 2. One-Time Amortization Payments

The calculator supports **lump-sum extra payments** that can be made at specific dates:

### Features:
- **Flexible timing**: Payments can be scheduled for any specific date
- **Custom amounts**: Any amount can be specified
- **Penalty calculation**: Optional penalty percentage can be applied
- **Principal reduction**: Extra payments directly reduce the principal balance
- **Interest savings**: Reduces total interest paid over the loan term

### Use Cases:
- Tax refunds or bonuses
- Inheritance or windfall payments
- Sale of other assets
- Year-end bonus payments

### Implementation:
- Users can add multiple one-time payments
- Each payment includes: amount, date, and penalty percentage
- Payments are applied to the principal balance on the specified date
- The remaining loan term is recalculated accordingly

## 3. Periodic Amortization Payments

The calculator supports **recurring extra payments** at regular intervals:

### Features:
- **Scheduled intervals**: Payments every N months (e.g., every 6 months)
- **Time-bound**: Can specify start and end periods
- **Consistent amounts**: Same extra payment amount each time
- **Penalty handling**: Optional penalty percentage for each payment
- **Flexible scheduling**: Multiple periodic payment schedules can coexist

### Simulation Options:
- **Amount**: Fixed extra payment amount
- **Interval**: How often to make the payment (in months)
- **Start Period**: When to begin the periodic payments
- **End Period**: When to stop the periodic payments
- **Penalty**: Optional penalty percentage

### Use Cases:
- Quarterly bonus payments
- Semi-annual windfalls
- Regular investment returns
- Annual tax refunds

## 4. Combined Amortization Strategies

The calculator allows users to combine multiple amortization types:

### Supported Combinations:
- **Standard + One-time**: Regular payments plus occasional lump sums
- **Standard + Periodic**: Regular payments plus recurring extra payments
- **All three types**: Standard payments, periodic extras, and one-time payments

### Benefits:
- **Maximum flexibility** in payment planning
- **Realistic scenarios** that match actual financial situations
- **Comprehensive analysis** of different payment strategies
- **Interest optimization** through strategic extra payments

## 5. Penalty Handling

Both one-time and periodic amortization payments support penalty calculations:

### Penalty Features:
- **Configurable percentage**: Users can specify penalty rates
- **Automatic calculation**: Penalties are calculated and added to payments
- **Separate tracking**: Penalties are tracked separately from principal payments
- **Total cost analysis**: Includes penalties in total payment calculations

### Common Penalty Scenarios:
- **Early repayment penalties**: Some loans charge for extra payments
- **Administrative fees**: Processing fees for additional payments
- **Interest rate adjustments**: Some loans adjust rates for extra payments

## 6. Amortization Schedule Visualization

The calculator provides detailed amortization schedules that show:

### Schedule Columns:
- **Payment Number**: Sequential payment identifier
- **Date**: Payment due date
- **Total Payment**: Regular payment + extra payments + penalties
- **Principal Payment**: Regular principal + extra principal payments
- **Interest Payment**: Interest portion of regular payment
- **Amortization Amount**: One-time extra payment amount
- **Periodic Amount**: Recurring extra payment amount
- **Penalty Amount**: Total penalties for the period
- **Remaining Balance**: Principal balance after payment

### Visual Indicators:
- **Color coding**: Different background colors for different payment types
- **Summary statistics**: Total interest, total extra payments, total penalties
- **Interest savings**: Comparison with standard amortization
- **Payoff timeline**: Shows when the loan will be fully paid off

## 7. Financial Impact Analysis

The calculator provides comprehensive analysis of different amortization strategies:

### Key Metrics:
- **Total Interest Paid**: Complete interest cost over loan term
- **Interest Savings**: Amount saved compared to standard amortization
- **Payoff Time**: How much faster the loan is paid off
- **Total Extra Payments**: Sum of all additional payments made
- **Total Penalties**: Sum of all penalties paid
- **Effective Interest Rate**: True cost of borrowing

### Comparison Features:
- **Side-by-side analysis**: Compare different payment strategies
- **Percentage savings**: Interest savings as percentage of total interest
- **Time savings**: Months or years saved on loan term
- **Cost-benefit analysis**: Penalty costs vs. interest savings

## 8. Practical Applications

### For Borrowers:
- **Payment planning**: Optimize extra payment timing and amounts
- **Budget management**: Plan for irregular income or windfalls
- **Loan comparison**: Evaluate different loan terms and rates
- **Financial goal setting**: Plan for early loan payoff

### For Financial Advisors:
- **Client education**: Demonstrate impact of different payment strategies
- **Scenario analysis**: Show various "what-if" scenarios
- **Risk assessment**: Evaluate penalty costs vs. interest savings
- **Recommendation support**: Provide data-driven payment advice

## Conclusion

The mortgage calculator's amortization features provide comprehensive tools for understanding and optimizing mortgage payments. By supporting multiple payment types, penalty calculations, and detailed analysis, users can make informed decisions about their mortgage strategy and potentially save thousands in interest payments while paying off their loans faster.

The combination of mathematical precision with practical flexibility makes this calculator a valuable tool for both individual borrowers and financial professionals.
