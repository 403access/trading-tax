export enum LogLevel {
	ERROR = 0,
	WARN = 1,
	INFO = 2,
	DEBUG = 3,
}

export interface LoggerConfig {
	level: LogLevel;
	enableTimestamps?: boolean;
	enableColors?: boolean;
	features?: Record<string, LogLevel | "off">;
}

const DEFAULT_CONFIG = {
	level: LogLevel.INFO,
	enableTimestamps: false,
	enableColors: true,
	features: {
		dataLoading: LogLevel.INFO,
		transferDetection: LogLevel.INFO,
		taxCalculations: LogLevel.INFO,
		transactionProcessing: "off" as const,
		priceData: LogLevel.INFO,
		statistics: LogLevel.INFO,
		fifoQueue: "off" as const,
		results: LogLevel.INFO,
	},
} as const;

// Extract feature keys as type-safe union
type FeatureKey = keyof typeof DEFAULT_CONFIG.features;

// Load logger configuration from file (optional override)
function loadLoggerConfig(): LoggerConfig {
	// Start with defaults
	const config: LoggerConfig = {
		level: DEFAULT_CONFIG.level,
		enableTimestamps: DEFAULT_CONFIG.enableTimestamps,
		enableColors: DEFAULT_CONFIG.enableColors,
		features: { ...DEFAULT_CONFIG.features },
	};

	try {
		const fs = require("fs");
		const path = require("path");
		const configPath = path.join(process.cwd(), "config/logger.json");

		// Check if config file exists
		if (!fs.existsSync(configPath)) {
			return config;
		}

		const configFile = JSON.parse(fs.readFileSync(configPath, "utf8"));

		// Convert string level to enum
		const levelMap: Record<string, LogLevel> = {
			ERROR: LogLevel.ERROR,
			WARN: LogLevel.WARN,
			INFO: LogLevel.INFO,
			DEBUG: LogLevel.DEBUG,
		};

		// Override global level if specified
		if (configFile.level) {
			config.level = levelMap[configFile.level] ?? config.level;
		}

		// Override other settings if specified
		if (configFile.enableTimestamps !== undefined) {
			config.enableTimestamps = configFile.enableTimestamps;
		}
		if (configFile.enableColors !== undefined) {
			config.enableColors = configFile.enableColors;
		}

		// Override feature levels if specified
		if (configFile.features) {
			for (const [key, value] of Object.entries(configFile.features)) {
				if (typeof value === "string") {
					if (value === "off") {
						config.features![key] = "off";
					} else {
						config.features![key] = levelMap[value] ?? LogLevel.INFO;
					}
				} else if (typeof value === "boolean") {
					// Support legacy boolean format
					config.features![key] = value ? LogLevel.INFO : "off";
				}
			}
		}

		return config;
	} catch {
		// Fall back to default config if file can't be parsed
		return config;
	}
}

class Logger {
	private config: LoggerConfig;

	constructor(config: LoggerConfig = DEFAULT_CONFIG) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	private shouldLog(level: LogLevel): boolean {
		return level <= this.config.level;
	}

	private formatMessage(level: LogLevel, message: string): string {
		let formatted = message;

		if (this.config.enableTimestamps) {
			const timestamp = new Date().toISOString();
			formatted = `[${timestamp}] ${formatted}`;
		}

		if (this.config.enableColors) {
			const colors = {
				[LogLevel.ERROR]: "\x1b[31m", // Red
				[LogLevel.WARN]: "\x1b[33m", // Yellow
				[LogLevel.INFO]: "\x1b[36m", // Cyan
				[LogLevel.DEBUG]: "\x1b[37m", // White
			};
			const reset = "\x1b[0m";
			formatted = `${colors[level]}${formatted}${reset}`;
		}

		return formatted;
	}

	error(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.ERROR)) {
			console.error(this.formatMessage(LogLevel.ERROR, message), ...args);
		}
	}

	warn(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.WARN)) {
			console.warn(this.formatMessage(LogLevel.WARN, message), ...args);
		}
	}

	info(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.INFO)) {
			console.log(this.formatMessage(LogLevel.INFO, message), ...args);
		}
	}

	debug(message: string, ...args: any[]): void {
		if (this.shouldLog(LogLevel.DEBUG)) {
			console.log(this.formatMessage(LogLevel.DEBUG, message), ...args);
		}
	}

	// Feature-specific logging using configured levels
	log(feature: FeatureKey, message: string, ...args: any[]): void {
		const featureLevel = this.config.features?.[feature];

		// Skip if feature is disabled or doesn't exist in config
		if (featureLevel === "off" || featureLevel === undefined) return;

		// Use the feature's configured level and check against global level
		if (this.shouldLog(featureLevel)) {
			const output =
				featureLevel === LogLevel.ERROR
					? console.error
					: featureLevel === LogLevel.WARN
						? console.warn
						: console.log;
			output(this.formatMessage(featureLevel, message), ...args);
		}
	}

	// Overloaded method for custom log levels (backwards compatibility)
	logWithLevel(
		feature: string,
		level: LogLevel,
		message: string,
		...args: any[]
	): void {
		const featureLevel = this.config.features?.[feature];

		// Skip if feature is disabled or doesn't exist in config
		if (featureLevel === "off" || featureLevel === undefined) return;

		// Check if the feature allows this level and global level allows it
		if (level <= featureLevel && this.shouldLog(level)) {
			const output =
				level === LogLevel.ERROR
					? console.error
					: level === LogLevel.WARN
						? console.warn
						: console.log;
			output(this.formatMessage(level, message), ...args);
		}
	}

	// Configuration methods
	setLevel(level: LogLevel): void {
		this.config.level = level;
	}

	setConfig(config: Partial<LoggerConfig>): void {
		this.config = { ...this.config, ...config };
	}
}

// Export singleton logger instance
export const logger = new Logger(loadLoggerConfig());
