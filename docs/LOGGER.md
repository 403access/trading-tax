# Enhanced Configurable Logger System

## Overview

The logger system now uses an enum-based approach with configurable log levels for each feature, providing much more granular control than the previous boolean-based system.

## Configuration

### Log Levels (Global and Per-Feature)
- `ERROR` (0): Only critical errors
- `WARN` (1): Warnings and errors
- `INFO` (2): General information, warnings, and errors
- `DEBUG` (3): Detailed debugging information plus all above
- `off`: Disable logging for that feature entirely

### Features Available
- `dataLoading`: Transaction file loading and parsing
- `transferDetection`: Transfer analysis between exchanges
- `taxCalculations`: Individual transaction tax calculations
- `transactionProcessing`: Detailed transaction processing steps
- `priceData`: Historical price data loading and operations
- `statistics`: Summary statistics and counts
- `fifoQueue`: FIFO queue operations (very verbose)
- `results`: Final calculation results

## Usage Examples

### Basic Usage
```typescript
import { logger, LogLevel, LogFeature } from '../core/logger';

// Use convenience methods (with default levels)
logger.dataLoading("Loading transactions...");
logger.transferDetection("Found potential transfer");
logger.taxCalculations("Processing withdrawal");

// Use with specific log levels
logger.priceData("Debug price info", LogLevel.DEBUG);
logger.taxCalculations("Tax warning", LogLevel.WARN);
```

### Direct Feature Logging
```typescript
// Use the generic log method for full control
logger.log(LogFeature.TRANSFER_DETECTION, LogLevel.ERROR, "Transfer detection failed");
logger.log(LogFeature.PRICE_DATA, LogLevel.DEBUG, "Price lookup details");
```

## Configuration Examples

### Production (Minimal Output)
```json
{
    "level": "WARN",
    "enableTimestamps": true,
    "enableColors": false,
    "features": {
        "dataLoading": "WARN",
        "transferDetection": "off",
        "taxCalculations": "WARN",
        "transactionProcessing": "off",
        "priceData": "WARN",
        "statistics": "INFO",
        "fifoQueue": "off",
        "results": "INFO"
    }
}
```

### Development (Verbose Debugging)
```json
{
    "level": "DEBUG",
    "enableTimestamps": true,
    "enableColors": true,
    "features": {
        "dataLoading": "INFO",
        "transferDetection": "DEBUG",
        "taxCalculations": "DEBUG",
        "transactionProcessing": "DEBUG",
        "priceData": "DEBUG",
        "statistics": "INFO",
        "fifoQueue": "DEBUG",
        "results": "INFO"
    }
}
```

### Transfer Detection Focus
```json
{
    "level": "INFO",
    "enableTimestamps": false,
    "enableColors": true,
    "features": {
        "dataLoading": "WARN",
        "transferDetection": "DEBUG",
        "taxCalculations": "off",
        "transactionProcessing": "off",
        "priceData": "off",
        "statistics": "INFO",
        "fifoQueue": "off",
        "results": "INFO"
    }
}
```

## How It Works

1. **Global Level**: Acts as a minimum threshold - no message below this level will show
2. **Feature Level**: Each feature can have its own level or be disabled entirely
3. **Message Level**: Each log call specifies what level the message is
4. **Resolution**: A message shows only if:
   - Feature is not "off"
   - Message level ≤ Feature level 
   - Message level ≤ Global level

## Migration from Previous System

The system maintains backward compatibility with the old boolean-based configuration:
- `true` → `"INFO"`
- `false` → `"off"`

## Benefits

1. **Granular Control**: Set different verbosity for different system components
2. **Production Ready**: Easy to create clean, minimal output for production
3. **Debugging Support**: Enable detailed logging only for components you're investigating
4. **Maintainable**: Clear separation of concerns with enum-based features
5. **Flexible**: Mix and match log levels to create perfect output for your use case
