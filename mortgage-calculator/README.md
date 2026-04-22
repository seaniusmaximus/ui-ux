# Mortgage Calculator

A simple React + TypeScript mortgage calculator with animated UI interactions and affordability guidance.

## Overview

This example lets a user adjust key mortgage inputs and instantly see:

- Estimated monthly payment
- Payment breakdown (principal + interest, property tax, home insurance)
- Total repayment across the full term
- Debt-to-income ratio
- Affordability guidance based on common budgeting thresholds

The app uses sliders for most inputs, a term toggle for loan length, and GSAP animations for smoother UI transitions.

## Built With

- React
- TypeScript
- Vite
- GSAP
- HTML + CSS

## Features

- **Live mortgage math** using a standard amortization formula
- **Inputs**
  - Home price
  - Monthly income
  - Monthly expenses
  - Down payment
  - Interest rate
  - Loan term toggle (15 or 30 years)
  - Property tax (annual)
  - Home insurance (annual)
- **Affordability status** (`affordable` or `caution`)
- **Color feedback**
  - Home price and monthly expenses become less favorable as values rise
  - Down payment color changes based on closeness to a 20% target
- **Tooltip guidance** for recommended down payment
- **GSAP animations** on initial render and result updates

## Affordability Logic

The app computes a suggested monthly housing cap as the lower of:

- `28%` of monthly income, and
- a debt-to-income constraint based on `43%` total debt ratio after existing monthly expenses

Estimated monthly payment is compared against that cap to determine whether the scenario appears affordable.

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```text
src/
  App.tsx      # calculator UI, state, and mortgage logic
  App.css      # component styling
  index.css    # global styles and color variables
```

## Notes

- This is an educational example and not financial advice.
- Real lender qualification may include credit score, HOA fees, PMI, taxes/insurance differences by location, and other underwriting factors.