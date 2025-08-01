# Security & Privacy Guidelines

## 🔒 Data Protection

This crypto tax calculator is designed with **privacy-first principles**:

### ✅ What's Protected
- **Transaction Data**: All your exchange CSV files are excluded from version control
- **Personal Information**: No transaction data leaves your machine
- **Financial Details**: Amounts, dates, and trading history remain private
- **Exchange Data**: Bitcoin.de, Kraken, and other exchange exports are secured

### ✅ What's Safe to Share
- Source code (calculation logic, parsers, handlers)
- Configuration templates (without your actual file paths)
- Documentation and architecture
- Historical price data (public market data)

## 📁 File Security Structure

```
✅ SAFE (tracked in git):
├── src/                    # Source code
├── config/                 # Configuration templates
├── docs/                   # Documentation
├── data/historical-prices/ # Public market price data
└── data/transactions/      # Directory structure only

❌ PRIVATE (excluded from git):
├── data/transactions/**/*.csv    # Your actual transaction files
├── *.csv                         # Any CSV files
└── .env                          # Environment variables
```

## 🛡️ Security Best Practices

### 1. **Local-Only Processing**
- All calculations happen on your local machine
- No data is sent to external servers
- No network requests for transaction processing
- Complete offline operation capability

### 2. **Version Control Protection**
- `.gitignore` automatically excludes sensitive files
- Directory structure maintained with `.gitkeep` files
- Documentation explains what data goes where
- Safe to fork and share the codebase

### 3. **Configuration-Based Security**
- File paths externalized to configuration
- No hardcoded sensitive paths in source code
- Easy to customize for different setups
- Template configurations provided

### 4. **Data Isolation**
- Transaction data separated from source code
- Clear boundaries between public and private data
- Historical price data (public) vs transaction data (private)
- Modular architecture prevents accidental exposure

## 🚨 Security Warnings

### ❌ **NEVER DO THIS:**
- Commit actual transaction CSV files to git
- Share your `data/transactions/` folder
- Upload transaction files to cloud services
- Include personal transaction data in bug reports
- Share screenshots with transaction details

### ✅ **ALWAYS DO THIS:**
- Keep transaction files local only
- Use `.gitignore` to protect sensitive data
- Review files before committing to version control
- Share only source code, never data files
- Use sample/template data for examples

## 🔧 Safe Development Practices

### Contributing to the Project
If you want to contribute improvements:

1. **Fork the repository** - only source code, no personal data
2. **Make your changes** - improve calculations, add exchanges, etc.
3. **Test with sample data** - create fake test transactions
4. **Submit pull request** - source code only, never include real data

### Reporting Issues
When reporting bugs:

1. **Describe the problem** - what calculation is wrong?
2. **Use sample data** - create minimal test cases
3. **Share relevant logs** - but remove personal details
4. **Include configuration** - but remove your file paths

### Testing Changes
- Use fake/sample transaction data for testing
- Create minimal test cases with known results
- Verify calculations with small datasets
- Never test with your actual financial data in version control

## 📋 Privacy Checklist

Before sharing anything related to this project:

- [ ] No actual transaction CSV files included
- [ ] No personal amounts, dates, or trading details
- [ ] Configuration files contain only templates/examples
- [ ] Screenshots don't show real financial data
- [ ] File paths don't reveal personal information
- [ ] Only source code and documentation shared

## 🏆 Result

This setup ensures that:
- **Your financial data stays private and secure**
- **The project code can be safely shared and improved**
- **You maintain full control over your sensitive information**
- **Contributors can enhance the calculator without accessing your data**

The crypto tax calculator provides **professional-grade privacy protection** while enabling collaborative development and code sharing.
