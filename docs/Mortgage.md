# Mortgage Calculator with French Amortization System

The French amortization system (also called the constant payment system) involves fixed periodic payments that cover both interest and principal, with the interest portion decreasing over time and the principal portion increasing.

## 1. Required Inputs

P : principal (loan amount)

r : annual interest rate (as a decimal, e.g., 6% → 0.06)

n : total number of payments (e.g., years × 12 for monthly payments)

m : number of payments per year (commonly 12)

## 2. Payment Formula

The fixed installment A is calculated as:

A(P, r, n, m) = P * i / (1 - (1 + i)^(-n))


Where:

i = r / m is the periodic interest rate

n = years * m is the total number of payments

## 3. Amortization Schedule

For each payment k (where k ranges from 1 to n):

Interest(k) = Balance(k-1) * i
Principal(k) = A - Interest(k)
Balance(k) = Balance(k-1) - Principal(k)


With the initial condition:

Balance(0) = P


The process repeats until Balance(n) = 0.

## 4. Implementation Guidelines

Take inputs: principal (P), annual rate (r), loan term in years, and frequency (m).

Compute periodic rate: i = r / m.

Compute fixed payment using A(P, r, n, m).

Loop through each period k and calculate:

Interest(k)

Principal(k)

Balance(k)

Store results in a table to form the amortization schedule.

## 5. Example

Given:

P = 100000

r = 0.06

years = 10

m = 12

Then:

i = 0.06 / 12 = 0.005
n = 10 * 12 = 120
A = 100000 * 0.005 / (1 - (1.005)^(-120))
A ≈ 1110.21


The monthly payment is approximately 1110.21, constant across all 120 months. The interest portion decreases over time, while the principal portion increases.