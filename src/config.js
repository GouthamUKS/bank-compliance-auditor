import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const config = {
  // Audit Configuration
  auditUrl: process.env.AUDIT_URL || 'http://localhost:3000',
  wcagLevel: process.env.WCAG_LEVEL || 'AA',
  wcagVersion: process.env.WCAG_VERSION || '2.1',

  // API Configuration (Protected with .env)
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  apiEndpoint: process.env.API_ENDPOINT,

  // Compliance Thresholds
  maxCriticalIssues: parseInt(process.env.MAX_CRITICAL_ISSUES || '0'),
  maxSeriousIssues: parseInt(process.env.MAX_SERIOUS_ISSUES || '5'),
  maxModerateIssues: parseInt(process.env.MAX_MODERATE_ISSUES || '15'),

  // Report Configuration
  reportFormat: process.env.REPORT_FORMAT || 'json',
  reportOutputDir: process.env.REPORT_OUTPUT_DIR || './reports',
  includeScreenshots: process.env.INCLUDE_SCREENSHOTS === 'true',

  // Logging Configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || './logs/audit.log',

  // CI/CD Configuration
  failOnCritical: process.env.FAIL_ON_CRITICAL === 'true',
  failOnSerious: process.env.FAIL_ON_SERIOUS === 'true',
  notificationWebhook: process.env.NOTIFICATION_WEBHOOK,

  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  strictMode: process.env.STRICT_MODE === 'true',
};

// Validate critical configuration
export function validateConfig() {
  const errors = [];

  if (!config.auditUrl) {
    errors.push('AUDIT_URL environment variable is required');
  }

  if (config.strictMode && !config.apiKey) {
    errors.push('API_KEY environment variable is required in strict mode');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
}

export default config;
