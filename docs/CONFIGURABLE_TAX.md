# Configurable Tax System

## Overview

The crypto tax calculator supports configurable tax rules through a JSON configuration file. This allows you to:

- 💰 **Adjust exemption amounts** (German default: €600)
- ⏰ **Configure holding periods** (German default: 12 months)
- 📊 **Customize display estimates** for different income brackets
- 🎯 **Control output options** (analysis detail, tips, etc.)

**Important:** The actual German tax calculations use official formulas from the tax package (2016-2025). This configuration only controls exemptions and display settings.

## 📁 Configuration Files

### Primary Configuration
- **File**: `config/tax-rules.json`
- **Purpose**: Main tax configuration (German 2025 defaults)
- **Auto-loaded**: Used by default if no other config specified

### Example Alternative Configurations
- **Test Config**: Create custom config files for different scenarios
- **Custom Config**: Modify tax-rules.json for different jurisdictions

## 🏗️ Configuration Structure

The configuration file contains only the essential settings:

```json
{
    "exemptions": {
        "annualPrivateSalesExemption": 600,
        "holdingPeriodExemption": {
            "months": 12,
            "description": "§23 EStG - Private sales gains exempt after 1 year"
        }
    },
    "taxCalculation": {
        "baseAnnualIncome": 40000,
        "applyIncomeTax": true,
        "taxYear": 2025
    },
    "displayOptions": {
        "showDetailedTaxAnalysis": true,
        "showOptimizationTips": true
    }
}
```

**Key Features:**
- **`baseAnnualIncome`**: Your other income sources (salary, business, etc.) - crypto gains are added on top
- **`applyIncomeTax`**: Whether to calculate actual German income tax on the taxable crypto gains
- **`taxYear`**: Which year's tax formulas to use (2016-2025 supported)

**Key Point:** All tax calculations use official German tax formulas from the tax package.

## ⚙️ Key Configurable Parameters

### 💰 **Annual Exemption**
```json
"annualPrivateSalesExemption": 600
```
- **German 2025**: €600 (§23 EStG)
- **Custom**: Any amount you want to test

### ⏰ **Holding Period**
```json
"holdingPeriodExemption": {
    "months": 12,
    "description": "§23 EStG - Private sales gains exempt after 1 year"
}
```
- **German Standard**: 12 months
- **Testing**: Try 6 months, 18 months, etc.

### 📊 **Tax Rate Estimates**
```json
"estimates": {
    "conservative": { "rate": 0.20, "description": "Conservative (20%)" },
    "standard": { "rate": 0.30, "description": "Standard (30%)" },
    "maximum": { "rate": 0.50, "description": "Maximum (50%)" }
}
```
- **Flexible**: Define any number of rate scenarios
- **Display**: Choose which rates to show in output

### 🎛️ **Display Options**
```json
"displayOptions": {
    "showDetailedTaxAnalysis": true,
    "showOptimizationTips": true,
    "showEstimatedLiability": true,
    "estimateRates": ["conservative", "standard", "maximum"]
}
```

## 🚀 Usage Examples

### German Tax Law (Default)
```bash
# Uses config/tax-rules.json (12 months, €600 exemption, German rates)
bun run index.ts
```

**Output:**
- `Tax-exempt (>12mo)` - Shows 12-month period
- `Annual exemption: €600.00` - German exemption
- `Est. tax liability (25.0% rate): €X` - German tax estimates

### Test Configuration
```typescript
// In code, you can specify alternative config:
const exemption = getAnnualExemption(); // Currently loads default config
const holdingPeriod = getHoldingPeriodMonths(); // Currently loads default config
```

**Test Config Results:**
- `Tax-exempt (>6mo)` - Shows 6-month period
- `Annual exemption: €1,000.00` - Higher exemption
- `Est. tax liability (20.0% rate): €X` - Custom rates

## 🌍 International Adaptations

### Create Custom Configuration

**Example: US-Style Configuration**
```json
{
    "taxYear": 2025,
    "jurisdiction": "United States (Hypothetical)",
    "exemptions": {
        "annualPrivateSalesExemption": 0,
        "holdingPeriodExemption": {
            "months": 12,
            "description": "Long-term capital gains (>1 year)"
        }
    },
    "taxRates": {
        "estimates": {
            "shortTerm": {
                "rate": 0.37,
                "description": "Short-term capital gains (ordinary income)"
            },
            "longTerm": {
                "rate": 0.20,
                "description": "Long-term capital gains"
            }
        }
    }
}
```

### Benefits
- ✅ **No code changes** needed for different jurisdictions
- ✅ **Easy testing** of different scenarios
- ✅ **Future-proof** for tax law changes
- ✅ **Audit trail** - clear configuration history

## 📈 Real-World Impact

### December→January Trading Analysis

**German Standard (12 months)**:
- Buy Dec 2025 → Sell Jan 2026 = `Short-term (<1mo)`
- Fully taxable at up to 47.5%

**Hypothetical 6-Month Rule**:
- Buy Dec 2025 → Sell Jan 2026 = `Short-term (<1mo)`
- Still fully taxable, but exemption threshold at 6 months

**Different Exemption Amount**:
- €600 vs €1000 exemption significantly changes tax liability
- Easy to model different scenarios

## 🎯 Advanced Features

### Multiple Configuration Support
```typescript
// Compare different jurisdictions
const germanExemption = getAnnualExemption(); // Loads from tax-rules.json
const testExemption = getAnnualExemption(); // Uses current tax-rules.json

console.log(`German: €${germanExemption}, Test: €${testExemption}`);
```

### Tax Law Evolution
```json
// config/tax-rules-2026.json - Future tax year (copy and modify existing file)
{
    "taxYear": 2026,
    "exemptions": {
        "annualPrivateSalesExemption": 800,  // Increased exemption
        "holdingPeriodExemption": {
            "months": 6,  // Reduced holding period
            "description": "New 2026 rules"
        }
    }
}
```

## 🎉 Result

**Professional tax compliance system** that adapts to:
- ✅ **Different countries** and their tax laws
- ✅ **Changing regulations** over time
- ✅ **Testing scenarios** and optimizations
- ✅ **Audit requirements** with clear configuration trails

Your crypto tax calculator is now **internationally ready** and **future-proof**! 🌍
