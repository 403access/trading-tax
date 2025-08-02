# Simplified Logger System

## Overview

The logger now works with **TypeScript-first configuration** where the JSON file is **optional** and only used for runtime overrides.

## Default Configuration (TypeScript)

```typescript
// src/core/logger.ts
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
```

## Usage

### Primary API (uses configured level from TypeScript defaults)
```typescript
logger.log("dataLoading", "Loading transactions...");
logger.log("transferDetection", "Found transfer");
logger.log("taxCalculations", "Processing withdrawal");
```

### Override API (for special log levels)
```typescript
logger.logWithLevel("priceData", LogLevel.DEBUG, "Debug price info");
logger.logWithLevel("transferDetection", LogLevel.ERROR, "Transfer failed");
```

## Optional JSON Override

Create `config/logger.json` **only if you need runtime overrides**:

```json
{
  "level": "DEBUG",
  "features": {
    "transferDetection": "off",
    "priceData": "DEBUG"
  }
}
```

## Benefits

✅ **No Duplication**: Single source of truth in TypeScript  
✅ **Type Safety**: Feature keys enforced at compile time  
✅ **Optional JSON**: Only needed for runtime overrides  
✅ **Zero Config**: Works out of the box with TypeScript defaults  
✅ **Clean API**: `logger.log("feature", "message")` - simple and clear  

## Migration

- **Development**: Delete `config/logger.json` and adjust TypeScript defaults
- **Production**: Keep `config/logger.json` for runtime configuration
- **CI/CD**: JSON file can be generated/templated based on environment
