# Architecture Overview

This document describes the modular architecture of the crypto tax calculator, designed for maintainability, type safety, and German tax law compliance.

## 📂 Directory Structure

### `/src/core/` - Core Business Logic
- **`types.ts`**: Central type definitions and interfaces
- **`tax-calculator.ts`**: Main FIFO processing engine with German tax law compliance
- **`utils.ts`**: Shared utility functions (number parsing, date calculations)
- **`logger.ts`**: Type-safe logging system with feature-specific controls

### `/src/handlers/` - Transaction Processing
Modular handlers for each transaction type:
- **`buy.ts`**: Purchase transactions (adds to FIFO queue)
- **`sell.ts`**: Sale transactions (removes from FIFO queue, calculates gains)
- **`withdrawal.ts`**: Withdrawal processing (taxable disposal at market price)
- **`deposit.ts`**: Deposit tracking (non-taxable)
- **`fee.ts`**: Fee accounting
- **`transfer.ts`**: Inter-exchange transfers (non-taxable)

### `/src/services/` - Business Services
- **`transfer-detection.ts`**: Identifies transfers between exchanges using exact amount matching
- **`price-lookup.ts`**: Historical price data loading and lookup

### `/src/parsers/` - Data Import
Exchange-specific CSV parsers that convert to unified format:
- **`bitcoin-de.ts`**: Bitcoin.de transaction parser
- **`kraken.ts`**: Kraken ledger parser

### `/src/output/` - Report Generation
- **`display.ts`**: Formats and displays tax calculation results

### `/src/transactions/` - Data Loading
- **`load-transactions.ts`**: Orchestrates loading from multiple sources

### `/config/` - Configuration
- **`data-sources.json`**: Maps transaction files and data sources
- **`logger.json`**: Optional logging configuration (overrides TypeScript defaults)

## 🔄 Data Flow

```
1. Configuration Loading
   ├── data-sources.json → File paths
   └── logger.json → Logging overrides (optional)

2. Data Import
   ├── CSV Files → Parsers → UnifiedTransaction[]
   └── Price Data → Historical prices

3. Processing Pipeline
   ├── Transfer Detection → Mark inter-exchange movements
   ├── FIFO Sorting → Chronological order
   └── Tax Calculation → Process each transaction type

4. Output Generation
   └── Format Results → Display tax report
```

## 🔧 Key Design Patterns

### 1. **Unified Transaction Format**
All exchanges convert to a common `UnifiedTransaction` interface:
```typescript
interface UnifiedTransaction {
  type: "buy" | "sell" | "deposit" | "withdrawal" | "fee" | "transfer";
  date: string;
  btcAmount: number;
  eurAmount: number;
  source: string;
  transferId?: string;
}
```

### 2. **Modular Handler Pattern**
Each transaction type has its own handler with consistent interface:
```typescript
export function processBuyTransaction(
  tx: UnifiedTransaction, 
  queue: PurchaseEntry[]
): number
```

### 3. **Type-Safe Configuration**
- TypeScript-first configuration with compile-time type safety
- Optional JSON overrides for runtime configuration
- Feature keys derived from TypeScript definitions

### 4. **Separation of Concerns**
- **Parsers**: Only handle CSV → UnifiedTransaction conversion
- **Handlers**: Only handle specific transaction type logic
- **Services**: Handle cross-cutting concerns (transfers, prices)
- **Core**: Orchestrate the overall process

## 🇩🇪 German Tax Law Implementation

### FIFO Compliance
1. **Chronological Sorting**: All transactions sorted by date before processing
2. **Queue Management**: Purchases added to FIFO queue, disposals remove oldest first
3. **One-Year Exemption**: Automatic calculation of holding periods

### Transfer Detection
1. **Exact Matching**: Withdrawal amount = Deposit amount (within tolerance)
2. **Time Window**: Configurable tolerance (default: 30 days)
3. **Cross-Exchange**: Different source exchanges only
4. **Non-Taxable**: Transfers marked and excluded from tax calculations

### Market Pricing
1. **Historical Data**: Uses actual historical price data
2. **Withdrawal Valuation**: Market price at time of withdrawal
3. **Accurate Reporting**: Proper cost basis and gain calculations

## 🔍 Type Safety Features

### Compile-Time Guarantees
- **Transaction Types**: Exhaustive pattern matching prevents missing cases
- **Logger Features**: Feature keys validated at compile time
- **Configuration**: Strong typing prevents configuration errors

### Runtime Safety
- **Input Validation**: CSV parsing with error handling
- **Amount Matching**: Precise decimal comparison for transfers
- **Date Parsing**: Robust date handling across different formats

## 🚀 Extensibility

### Adding New Exchanges
1. Create parser in `/src/parsers/new-exchange.ts`
2. Implement `UnifiedTransaction` conversion
3. Add to data sources configuration
4. No changes needed to core logic

### Adding New Transaction Types
1. Extend `UnifiedTransaction` type union
2. Create handler in `/src/handlers/new-type.ts`
3. Add case to main processing loop
4. Type system ensures exhaustive handling

### Adding New Features
1. Add feature to logger configuration
2. Use `logger.log("newFeature", "message")`
3. Type safety ensures valid feature names
4. Runtime configuration available via JSON

This architecture provides a solid foundation for accurate German tax compliance while remaining maintainable and extensible.
