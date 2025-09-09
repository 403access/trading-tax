# Crypto Tax Calculator

## TODO

- Handle open positions and thus unrealized PnL.
- Show expenses and assign them whether they are tax reductable.

A German tax law compliant cryptocurrency tax calculator with advanced transfer detection and modular architecture.

## ✨ Features

- ✅ **Sequence Diagram - Bank Account / Credit Card Transactions** (§ 23 EStG)
- ✅ **German Tax Law Compliant** (§ 23 EStG)
- ✅ **FIFO Method** for cost basis calculation  
- ✅ **One-Year Holding Period Exemption** for long-term holdings
- ✅ **Multi-Exchange Support** (Bitcoin.de, Kraken)
- ✅ **Transfer Detection** between exchanges (non-taxable)
- ✅ **Withdrawal Tracking** (treated as taxable disposals at market price)
- ✅ **Fee Tracking** and proper accounting
- ✅ **Type-Safe Logging** with configurable features
- ✅ **Modular Architecture** with clean separation of concerns

## 🏗️ Architecture

```
├── config/                         # Configuration files
│   ├── data-sources.json           # Data source mappings
│   └── logger.json                 # Optional logging overrides
├── data/                           # Transaction data (gitignored)
│   ├── transactions/               # CSV transaction files
│   └── historical-prices/          # Price data
├── src/
│   ├── core/                       # Core business logic
│   │   ├── types.ts                # Type definitions
│   │   ├── utils.ts                # Utility functions
│   │   ├── tax-calculator.ts       # Main processing engine
│   │   └── logger.ts               # Type-safe logging system
│   ├── handlers/                   # Transaction type handlers
│   │   ├── buy.ts                  # Buy transaction processing
│   │   ├── sell.ts                 # Sell transaction processing
│   │   ├── withdrawal.ts           # Withdrawal processing
│   │   ├── deposit.ts              # Deposit processing
│   │   ├── fee.ts                  # Fee processing
│   │   └── transfer.ts             # Transfer processing
│   ├── parsers/                    # Exchange-specific parsers
│   │   ├── bitcoin-de.ts           # Bitcoin.de CSV parser
│   │   └── kraken.ts               # Kraken CSV parser
│   ├── services/                   # Business services
│   │   ├── transfer-detection.ts   # Transfer detection logic
│   │   └── price-lookup.ts         # Historical price lookup
│   ├── output/                     # Result formatting
│   │   └── display.ts              # Report generation
│   ├── transactions/               # Transaction loading
│   │   └── load-transactions.ts
│   └── app.ts                      # Application orchestration
├── docs/                           # Documentation
└── index.ts                        # Entry point
```

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run the tax calculator
bun run index.ts
```

## 📁 Setup

### 1. Configure Data Sources
Edit `config/data-sources.json` to point to your transaction files:

```json
{
  "transactions": {
    "bitcoin-de": {
      "full": "data/transactions/bitcoin-de-transactions.csv"
    },
    "kraken": {
      "ledgers-2017": "data/transactions/kraken-ledgers-2017.csv"
    }
  },
  "historicalPrices": {
    "btc-eur-2016": "data/historical-prices/btc-eur-2016.csv",
    "btc-eur-2017": "data/historical-prices/btc-eur-2017.csv"
  }
}
```

### 2. Place Transaction Files
Put your exchange exports in `data/transactions/`:
- Bitcoin.de transaction export
- Kraken ledger export

### 3. Optional: Configure Logging
Create `config/logger.json` for custom logging (optional):

```json
{
  "level": "INFO",
  "features": {
    "transferDetection": "DEBUG",
    "taxCalculations": "off",
    "priceData": "WARN"
  }
}
```

## 🇩🇪 German Tax Law Compliance

### FIFO Method (First-In-First-Out)
- Oldest purchases are used first for calculating gains/losses
- Required by German tax law for cryptocurrencies
- Chronological processing ensures compliance

### One-Year Holding Period Exemption
- Assets held for more than one year are tax-exempt (§ 23 EStG)
- Applies to both sales and withdrawals
- Automatically calculated and displayed separately

### Transfer Detection
- Movements between exchanges are identified and marked non-taxable
- Exact amount matching with configurable time tolerance
- Prevents double taxation of internal transfers

### Disposal Events
- **Sales**: Taxable when converting crypto to EUR
- **Withdrawals**: Taxable when moving crypto off-exchange  
- **Transfers**: Non-taxable movements between your own accounts
- **Market Pricing**: Uses historical price data for accurate valuations

## 📊 Output Explanation

The calculator provides comprehensive tax reporting:

```
=== TAX RELEVANT (FIFO Method with Market-Priced Withdrawals) ===
Taxable Gain (EUR): 13,311.94
Tax-free Gain >1yr (EUR): 0.00
Total Realized Gain (EUR): 13,311.94

=== TRANSACTION STATISTICS ===
Buys: 300
Sells: 188
Deposits: 25
Withdrawals: 76
Transfers: 1 (between exchanges)

=== REMAINING PURCHASES (not yet sold) ===
Total remaining: 0.73 BTC (Value: 11,432.04 EUR)
```

## 🏗️ Core Components

### Transfer Detection (`src/services/transfer-detection.ts`)
- Identifies matching withdrawals/deposits between exchanges
- Exact amount matching with time tolerance
- Prevents taxation of internal movements

### Tax Calculator (`src/core/tax-calculator.ts`)
- FIFO-compliant processing engine
- German tax law implementation
- Handles all transaction types with proper sequencing

### Type-Safe Logging (`src/core/logger.ts`)
- Feature-specific logging with compile-time safety
- TypeScript-first configuration with optional JSON overrides
- Clean API: `logger.log("feature", "message")`

### Transaction Handlers (`src/handlers/`)
- Modular processing for each transaction type
- Consistent interface and error handling
- Easy to extend for new transaction types

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
