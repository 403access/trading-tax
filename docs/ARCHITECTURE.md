# Crypto Tax Calculator - Enhanced Architecture

## Reorganized File Structure

### Configuration
- `config/data-sources.json` - File paths and data source configuration
- `config/tax-rules.json` - German tax law configuration (FIFO, exemption periods)
- `config/exchanges.json` - Exchange-specific parsing configuration

### Data Organization
- `data/transactions/` - All transaction CSV files organized by exchange
  - `bitcoin-de/` - Bitcoin.de transaction files (2016-2017.csv, 2016.csv, 2017.csv)
  - `kraken/` - Kraken transaction files (ledgers-2017.csv, trades-2017.csv)
- `data/historical-prices/` - Historical price data files
  - `btc-eur-2016.csv` - 2016 Bitcoin price data
  - `btc-eur-2017.csv` - 2017 Bitcoin price data

### Source Code Structure
- `src/core/` - Core business logic
  - `tax-calculator.ts` - Main orchestrator coordinating all transaction processing
  - `types.ts` - TypeScript interfaces and type definitions
  - `utils.ts` - Utility functions (formatting, date calculations)
  - `index.ts` - Core exports

- `src/handlers/` - Transaction type handlers
  - `buy.ts` - Processes buy transactions and FIFO queue management
  - `sell.ts` - Handles sell transactions with FIFO tax calculations
  - `withdrawal.ts` - Manages withdrawals as disposals with market pricing and EUR valuation
  - `deposit.ts` - Processes BTC/EUR deposits with asset detection
  - `fee.ts` - Handles fee transactions
  - `index.ts` - Handler exports

- `src/services/` - External services
  - `price-lookup.ts` - Historical Bitcoin price data with interpolation
  - `index.ts` - Service exports

- `src/parsers/` - CSV parsers for different exchanges
  - `bitcoin-de.ts` - Bitcoin.de CSV parser
  - `kraken.ts` - Kraken CSV parser
  - `index.ts` - Parser exports

- `src/output/` - Results display and reporting
  - `formatter.ts` - Results display and reporting
  - `index.ts` - Output exports

- `src/transactions/` - Transaction management
  - `load-transactions.ts` - Transaction loading utilities

- `src/config.ts` - Configuration loading utilities
- `src/app.ts` - Main application orchestrator

### Application Entry Points
- `index.ts` - Simple entry point
- `src/app.ts` - Main application logic

### Documentation
- `docs/ARCHITECTURE.md` - This architecture documentation
- `README.md` - Project overview and usage instructions

## Benefits of Enhanced Organization

### 1. **Clear Separation of Concerns**
- **Business Logic** (`src/core/`) - Tax calculations, types, utilities
- **Data Processing** (`src/handlers/`) - Transaction-specific processing
- **External Services** (`src/services/`) - Price lookup, file operations
- **Data Organization** (`data/`) - All CSV files organized by exchange and type
- **Configuration** (`config/`) - Centralized configuration management

### 2. **Improved Maintainability**
- Related files are grouped together logically
- Configuration is externalized and easily modifiable
- Data files are organized and clearly labeled
- Import paths are shorter and more intuitive

### 3. **Enhanced Scalability**
- Easy to add new exchanges by adding configuration
- New transaction types can be added with dedicated handlers
- Historical price data can be extended by adding new CSV files
- Configuration-driven approach allows for easy customization

### 4. **Better Development Experience**
- Clean, shorter import paths
- Logical file organization
- Centralized configuration reduces hardcoded values
- Clear separation makes testing easier

### 5. **Production Ready**
- Configuration files allow for environment-specific settings
- Data organization supports multiple data sources
- Error handling and validation throughout
- Clear entry points for different use cases

## Usage

The enhanced architecture provides a clean, configuration-driven approach:

### Configuration-Driven Data Loading
```typescript
// Load configuration
const dataSources = loadDataSources();
const bitcoinDeConfig = dataSources.transactions["bitcoin-de"];
const krakenConfig = dataSources.transactions.kraken;

// Load transactions using configured paths
const allTransactions: UnifiedTransaction[] = [
  ...loadTransactions(parseBitcoinDe, bitcoinDeConfig.full, "Bitcoin.de"),
  ...loadTransactions(parseKraken, krakenConfig["ledgers-2017"], "Kraken"),
];
```

### Modular Transaction Processing
```typescript
// Main tax calculator coordinates all handlers
const results = processTransactions(allTransactions);

// Each handler processes specific transaction types:
// - buy.ts: Purchase processing and FIFO queue management
// - sell.ts: Sale processing with tax calculations
// - withdrawal.ts: Market-priced disposal calculations
// - deposit.ts: Asset-based deposit detection
// - fee.ts: Fee transaction handling
```

### Clean Import Structure
```typescript
// Core functionality
import { processTransactions, type UnifiedTransaction } from './core/index';
// Output formatting
import { displayResults } from './output/index';
// Transaction handlers
import { processBuyTransaction } from './handlers/index';
// Services
import { getBitcoinPrice } from './services/index';
```

Each component is focused on its specific responsibility while maintaining the same German tax compliance and FIFO methodology. The configuration-driven approach makes the system easily adaptable to new exchanges, data sources, and requirements.
