# Crypto Tax Calculator - Refactored Architecture

## File Structure

### Core Files
- `src/tax-calculator.ts` - Main orchestrator that coordinates all transaction processing
- `src/types.ts` - TypeScript interfaces and type definitions
- `src/utils.ts` - Utility functions (formatting, date calculations)
- `src/output.ts` - Results display and reporting

### Transaction Handlers (NEW)
- `src/buy-handler.ts` - Processes buy transactions and FIFO queue management
- `src/sell-handler.ts` - Handles sell transactions with FIFO tax calculations
- `src/withdrawal-handler.ts` - Manages withdrawals as disposals with market pricing
- `src/deposit-handler.ts` - Processes BTC/EUR deposits with asset detection
- `src/fee-handler.ts` - Handles fee transactions

### Data Processing
- `src/price-lookup.ts` - Historical Bitcoin price data with interpolation
- `src/parsers/` - CSV parsers for different exchanges (Bitcoin.de, Kraken)

## Benefits of Refactoring

### 1. **Separation of Concerns**
Each transaction type has its own dedicated handler, making the code easier to understand and maintain.

### 2. **Reusability**
Transaction handlers can be easily tested independently and reused in different contexts.

### 3. **Maintainability**
- Bug fixes only affect specific transaction types
- New features can be added to individual handlers
- Code is more readable and self-documenting

### 4. **Type Safety**
Each handler has its own return interface:
- `SellResult` - for sell transaction outcomes
- `WithdrawalResult` - for withdrawal processing results
- `DepositResult` - for deposit processing results

### 5. **Testing**
Individual functions can be unit tested in isolation, improving code quality and reliability.

## Usage

The main `processTransactions()` function now acts as an orchestrator:

```typescript
// Main tax calculator coordinates all handlers
for (const tx of transactions) {
    if (tx.type === "buy") {
        const eurAmount = processBuyTransaction(tx, purchaseQueue);
        // ...accumulate results
    } else if (tx.type === "sell") {
        const result = processSellTransaction(tx, purchaseQueue);
        // ...accumulate results
    }
    // ... other transaction types
}
```

Each handler is focused on its specific responsibility while maintaining the same German tax compliance and FIFO methodology.
