# Crypto Tax Calculator

A German tax law compliant cryptocurrency tax calculator supporting multiple exchanges.

## Features

- ✅ **German Tax Law Compliant** (§ 23 EStG)
- ✅ **FIFO Method** for cost basis calculation
- ✅ **One-Year Holding Period Exemption** for long-term holdings
- ✅ **Multi-Exchange Support** (Bitcoin.de, Kraken)
- ✅ **Withdrawal Tracking** (treated as taxable disposals)
- ✅ **Fee Tracking** and proper accounting

## Project Structure

```
├── src/
│   ├── types.ts              # Type definitions
│   ├── utils.ts              # Utility functions and formatting
│   ├── tax-calculator.ts     # Core tax calculation logic
│   ├── output.ts             # Result display and formatting
│   ├── parsers/
│   │   ├── bitcoin-de.ts     # Bitcoin.de CSV parser
│   │   ├── kraken.ts         # Kraken CSV parser
│   │   └── index.ts          # Parser exports
│   └── index.ts              # Main exports
└── index.ts                  # Entry point
```

## Usage

### Run the refactored version (recommended):
```bash
bun run dev:refactored
```

### Run the original unified version:
```bash
bun run dev:unified
```

### Run the original Bitcoin.de only version:
```bash
bun run dev
```

## Required Files

Place your exchange export files in the project root:

- `bitcoin-de-transactions.csv` - Bitcoin.de transaction export
- `kraken-ledgers-2017.csv` - Kraken ledger export

## German Tax Law Compliance

### FIFO Method (First-In-First-Out)
- Oldest purchases are used first for calculating gains/losses
- Required by German tax law for cryptocurrencies

### One-Year Holding Period
- Assets held for more than one year are tax-exempt
- Applies to both sales and withdrawals
- Automatically calculated and displayed separately

### Disposal Events
- **Sales**: Taxable when converting crypto to EUR
- **Withdrawals**: Taxable when moving crypto off-exchange
- **Market Value**: Uses last purchase price as approximation for withdrawals

### Output Explanation

- **Taxable Gain**: Amount subject to income tax
- **Tax-free Gain >1yr**: Gains from assets held >1 year (tax-exempt)
- **Total Gain**: Combined taxable + tax-free gains
- **Remaining Purchases**: Unsold crypto still in your portfolio

## Modules

### Core Types (`src/types.ts`)
- `UnifiedTransaction`: Standard transaction format
- `PurchaseEntry`: FIFO queue entries
- `TaxResults`: Calculation results

### Utilities (`src/utils.ts`)
- Number parsing and formatting
- Date calculations for one-year exemption

### Tax Calculator (`src/tax-calculator.ts`)
- Main FIFO processing logic
- German tax law implementation
- Gain/loss calculations

### Parsers (`src/parsers/`)
- Exchange-specific CSV parsing
- Converts to unified transaction format

### Output (`src/output.ts`)
- Formatted result display
- German tax law explanations

## Important Notes

⚠️ **Market Prices**: Withdrawal valuations use estimated prices (last purchase rate). For accurate tax filing, replace with actual market rates at withdrawal time.

⚠️ **Professional Advice**: This tool provides calculations based on common interpretations of German tax law. Consult a tax professional for official advice.

✅ **Accuracy**: The calculator implements proper FIFO methodology and one-year exemption rules as required by German law.To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
