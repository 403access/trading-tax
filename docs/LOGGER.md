# Type-Safe Logging System

## Overview

The logger uses a **TypeScript-first configuration** approach where the JSON file is **optional** and only used for runtime overrides. This eliminates duplication and provides compile-time type safety.

## ✨ Key Features

- 🔒 **Type-Safe Feature Keys**: Compile-time validation of feature names
- 🎯 **Clean API**: `logger.log("feature", "message")` - no manual log levels needed
- ⚡ **Zero Config**: Works out of the box with TypeScript defaults
- 📝 **Optional JSON**: Only needed for runtime overrides
- 🏗️ **Config-Driven Levels**: Log levels come from configuration, not code

## 🔧 Configuration

### TypeScript Configuration (Primary)

```typescript
// src/core/logger.ts - Single source of truth
const DEFAULT_CONFIG = {
  level: LogLevel.INFO,
  enableTimestamps: false,
  enableColors: true,
  features: {
    dataLoading: LogLevel.INFO,
    transferDetection: LogLevel.INFO,
    taxCalculations: LogLevel.INFO,
    transactionProcessing: 'off' as const,
    priceData: LogLevel.INFO,
    statistics: LogLevel.INFO,
    fifoQueue: 'off' as const,
    results: LogLevel.INFO,
  },
} as const;

// Type-safe feature keys derived from config
type FeatureKey = keyof typeof DEFAULT_CONFIG.features;
```

### Optional JSON Override

Create `config/logger.json` **only if you need runtime overrides**:

```json
{
  "level": "DEBUG",
  "enableTimestamps": true,
  "features": {
    "transferDetection": "off",
    "priceData": "DEBUG",
    "fifoQueue": "DEBUG"
  }
}
```

## 🚀 Usage

### Primary API (Config-Driven Levels)
```typescript
// Uses the feature's configured log level automatically
logger.log("dataLoading", "Loading transactions...");
logger.log("transferDetection", "Found transfer match");
logger.log("taxCalculations", "Processing withdrawal");

// Type-safe: These would cause compile errors
// logger.log("invalidFeature", "Won't compile!");  ❌
// logger.log("unknownKey", "Type error!");         ❌
```

### Override API (Custom Levels)
```typescript
// For cases where you need a specific log level
logger.logWithLevel("priceData", LogLevel.DEBUG, "Debug price info");
logger.logWithLevel("transferDetection", LogLevel.ERROR, "Transfer failed");
```

### Standard Logging
```typescript
// Traditional log levels still available
logger.info("General information");
logger.warn("Warning message");
logger.error("Error occurred");
logger.debug("Debug details");
```

## 🎯 Feature Configuration Examples

### Development Setup
```typescript
// Just edit TypeScript defaults - no JSON needed!
const DEFAULT_CONFIG = {
  features: {
    dataLoading: LogLevel.DEBUG,      // Verbose data loading
    transferDetection: LogLevel.INFO, // Show transfer detection
    taxCalculations: LogLevel.WARN,   // Only important tax messages
    transactionProcessing: 'off',     // Disable verbose processing
  }
}
```

### Production Override
```json
{
  "level": "WARN",
  "features": {
    "transferDetection": "off",
    "transactionProcessing": "off",
    "fifoQueue": "off"
  }
}
```

### Debugging Specific Issues
```json
{
  "level": "DEBUG",
  "features": {
    "transferDetection": "DEBUG",
    "priceData": "DEBUG"
  }
}
```

## 🏗️ Architecture Benefits

### 1. **No Duplication**
- Single source of truth in TypeScript
- JSON only for overrides, not complete configuration
- Eliminates sync issues between TypeScript and JSON

### 2. **Type Safety**
- Feature names validated at compile time
- Invalid features caught before runtime
- Auto-completion in IDEs

### 3. **Zero Configuration**
- Works immediately without any setup
- Sensible defaults built into code
- No required configuration files

### 4. **Runtime Flexibility**
- JSON overrides for production environments
- Easy to disable verbose features in production
- Environment-specific configuration possible

## 📝 Log Levels

| Level | Numeric Value | Use Case                       |
| ----- | ------------- | ------------------------------ |
| ERROR | 0             | Critical errors, failures      |
| WARN  | 1             | Warnings, potential issues     |
| INFO  | 2             | General information, progress  |
| DEBUG | 3             | Detailed debugging information |
| off   | N/A           | Disable feature completely     |