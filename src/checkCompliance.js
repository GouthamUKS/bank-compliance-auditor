#!/usr/bin/env node

/**
 * Compliance Check Script - Used in CI/CD to validate pass/fail
 * Reads the latest audit result and validates against thresholds
 */

import config from './config.js';
import logger from './logger.js';
import ComplianceChecker from './complianceChecker.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function checkCompliance() {
  try {
    // Find the latest report
    const reportsDir = path.join(__dirname, '..', config.reportOutputDir);
    
    if (!fs.existsSync(reportsDir)) {
      console.error('❌ No reports directory found. Run audit first.');
      process.exit(1);
    }

    const files = fs.readdirSync(reportsDir)
      .filter(f => f.startsWith('compliance-report') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error('❌ No compliance reports found. Run audit first.');
      process.exit(1);
    }

    const latestReportPath = path.join(reportsDir, files[0]);
    const report = JSON.parse(fs.readFileSync(latestReportPath, 'utf-8'));

    // Reconstruct audit results from report
    const auditResults = {
      url: report.auditResults.url,
      status: report.auditResults.status,
      compliance: report.auditResults.complianceScore,
      summary: {
        total: report.summary.total_issues,
        critical: report.summary.critical,
        serious: report.summary.serious,
        moderate: report.summary.moderate,
        minor: report.summary.minor,
      },
      issues: report.issues,
    };

    // Check compliance
    const checker = new ComplianceChecker(config);
    const complianceResult = checker.check(auditResults);

    // Log results
    console.log('\n═══════════════════════════════════════');
    console.log('COMPLIANCE CHECK RESULTS');
    console.log('═══════════════════════════════════════\n');

    console.log(
      `Status: ${complianceResult.passed ? '✅ PASSED' : '❌ FAILED'}\n`
    );

    complianceResult.report.summary.forEach((msg) => {
      console.log(`  ${msg}`);
    });

    console.log('\n═══════════════════════════════════════\n');

    // Exit with appropriate code
    process.exit(complianceResult.passed ? 0 : 1);
  } catch (error) {
    logger.error(`Compliance check error: ${error.message}`);
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

checkCompliance();
