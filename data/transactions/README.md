# Transaction Data Setup

This directory contains your personal transaction data from cryptocurrency exchanges. 

⚠️ **IMPORTANT: This folder contains sensitive financial information and is excluded from version control.**

## Required Directory Structure

```
data/transactions/
├── bitcoin-de/
│   ├── 2016-2017.csv       # Your main Bitcoin.de transaction export
│   ├── 2016.csv            # Historical Bitcoin.de data (if available)
│   └── 2017.csv            # Historical Bitcoin.de data (if available)
└── kraken/
    ├── ledgers-2017.csv    # Kraken ledger export
    └── trades-2017.csv     # Kraken trades export (if available)
```

## How to Set Up Your Data

### 1. Bitcoin.de Data
1. Log into your Bitcoin.de account
2. Go to transaction history/export
3. Download your transaction CSV file
4. Save as `data/transactions/bitcoin-de/2016-2017.csv`
5. If you have historical data for specific years, name them accordingly (2016.csv, 2017.csv, etc.)

### 2. Kraken Data
1. Log into your Kraken account
2. Go to History → Export
3. Export your ledger data as CSV
4. Save as `data/transactions/kraken/ledgers-2017.csv`
5. Optionally export trade data as `trades-2017.csv`

### 3. Historical Price Data
Historical Bitcoin price data should be placed in `data/historical-prices/`:
- `btc-eur-2016.csv` - 2016 Bitcoin price history
- `btc-eur-2017.csv` - 2017 Bitcoin price history

## Configuration

Update `config/data-sources.json` to match your file names and paths.

## Security Notes

- ✅ This directory is automatically excluded from git
- ✅ Your transaction data stays private on your local machine
- ✅ Only you have access to your financial information
- ❌ Never commit actual transaction files to version control
- ❌ Never share these files publicly

## File Format Requirements

### Bitcoin.de CSV Format
Expected columns: `Datum`, `Typ`, `Anzahl`, `Währung`, `Kurs`, `Gesamtpreis`, `Gebühr`

### Kraken CSV Format  
Expected columns: `txid`, `refid`, `time`, `type`, `subtype`, `aclass`, `asset`, `amount`, `fee`, `balance`

If your exported files have different column names, update the exchange configuration in `config/exchanges.json`.
