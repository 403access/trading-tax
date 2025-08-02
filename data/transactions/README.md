# 📁 Transaction Data Setup

This directory contains your **personal transaction data** from cryptocurrency exchanges.

⚠️ **CRITICAL**: This folder contains **sensitive financial information** and is **excluded from version control**.

## 🏗️ Required Directory Structure

```
data/transactions/
├── bitcoin-de/
│   ├── 2016-2017.csv       # Your main Bitcoin.de transaction export
│   ├── 2016.csv            # Historical Bitcoin.de data (if available)
│   └── 2017.csv            # Historical Bitcoin.de data (if available)
├── kraken/
│   ├── ledgers-2017.csv    # Kraken ledger export
│   └── trades-2017.csv     # Kraken trades export (if available)
└── other-exchanges/        # Additional exchange data
    ├── binance/
    ├── coinbase/
    └── custom/
```

## 🚀 Quick Setup Guide

### 1. **Bitcoin.de Data** 🇩🇪
1. **Login** to your Bitcoin.de account
2. **Navigate** to transaction history/export section
3. **Download** your complete transaction CSV file
4. **Save** as `data/transactions/bitcoin-de/2016-2017.csv`
5. **Optional**: Historical data by year (2016.csv, 2017.csv, etc.)

### 2. **Kraken Data** 🐙
1. **Login** to your Kraken account
2. **Go to** History → Export
3. **Export** ledger data as CSV
4. **Save** as `data/transactions/kraken/ledgers-2017.csv`
5. **Optional**: Export trade data as `trades-2017.csv`

### 3. **Historical Price Data** 📈
Bitcoin price history goes in `data/historical-prices/`:
- `btc-eur-2016.csv` - 2016 Bitcoin price history
- `btc-eur-2017.csv` - 2017 Bitcoin price history
- System automatically fetches missing price data when needed

## ⚙️ Configuration

The system uses **automatic discovery** combined with `config/data-sources.json`:

```json
{
  "exchanges": {
    "bitcoin-de": {
      "enabled": true,
      "files": ["data/transactions/bitcoin-de/2016-2017.csv"]
    },
    "kraken": {
      "enabled": true, 
      "files": ["data/transactions/kraken/ledgers-2017.csv"]
    }
  }
}
```

**Pro Tip**: The system auto-detects files, so minimal configuration needed!

## 🔒 Security & Privacy

### ✅ **What's Protected**
- **Complete Privacy**: All transaction data stays on your local machine
- **No Network Transmission**: Processing happens entirely offline
- **Version Control Safe**: `.gitignore` automatically excludes sensitive files
- **Modular Architecture**: Clear separation between code and data

### ❌ **Never Do This**
- Commit actual transaction CSV files to git
- Share your `data/transactions/` folder publicly
- Upload transaction files to cloud services unencrypted
- Include personal transaction data in bug reports
- Share screenshots with real financial details

### ✅ **Always Do This**
- Keep transaction files local only
- Use sample/template data for testing
- Review files before committing changes
- Share only source code, never personal data
- Backup transaction files securely (encrypted external storage)

## 📋 File Format Requirements

### Bitcoin.de CSV Format
**Required Columns**: `Datum`, `Typ`, `Anzahl`, `Währung`, `Kurs`, `Gesamtpreis`, `Gebühr`

### Kraken CSV Format
**Required Columns**: `txid`, `refid`, `time`, `type`, `subtype`, `aclass`, `asset`, `amount`, `fee`, `balance`

### Custom Exchange Support
The modular parser system supports additional exchanges:
- Create parser in `src/parsers/exchanges/`
- Add configuration in `config/data-sources.json`
- Follow existing parser patterns for consistency

## 🛠️ Advanced Features

### Transfer Detection
The system automatically detects transfers between exchanges:
- **Bitcoin.de ↔ Kraken**: Matches deposits/withdrawals by amount and timing
- **Automatic Matching**: Reduces manual reconciliation work  
- **Tax Optimization**: Ensures transfers aren't double-taxed

### German Tax Compliance
- **Hodling Period**: Automatically calculates 1-year holding periods
- **FIFO Processing**: First-in-first-out for tax calculations
- **Withdrawal Recognition**: Distinguishes between sales and transfers
- **Detailed Reporting**: Tax-ready output with acquisition costs

### Type-Safe Logging
- **Feature-Based Logging**: `logger.log("transferDetection", "message")`
- **Configurable Levels**: Adjust verbosity per feature
- **TypeScript Safety**: Compile-time validation of log features

## 🎯 Result

A **professional-grade privacy-first** crypto tax calculator that:
- ✅ Keeps your financial data completely private
- ✅ Processes everything locally and offline  
- ✅ Provides German tax law compliance
- ✅ Offers modular, extensible architecture
- ✅ Maintains type safety and code quality

Your sensitive transaction data never leaves your machine while providing accurate tax calculations!
