#!/usr/bin/env node

import config, { validateConfig } from './config.js';
import logger from './logger.js';
import AccessibilityAuditor from './auditor.js';
import ReportGenerator from './reportGenerator.js';
import ComplianceChecker from './complianceChecker.js';
import chalk from 'chalk';

/**
 * Main entry point for accessibility audit
 */
async function main() {
  try {
    // Validate configuration
    validateConfig();
    logger.info('Configuration validated successfully');

    console.log(chalk.bold.cyan('\n🔐 Bank Compliance & Accessibility Auditor\n'));
    console.log(chalk.gray(`Scanning: ${config.auditUrl}`));
    console.log(chalk.gray(`Standard: WCAG 2.1 Level ${config.wcagLevel}`));
    console.log(chalk.gray(`Environment: ${config.nodeEnv}\n`));

    // Step 1: Run accessibility audit
    console.log(chalk.bold.yellow('▶ Running accessibility audit...\n'));
    const auditor = new AccessibilityAuditor(config);
    const auditResults = await auditor.audit(config.auditUrl);

    // Step 2: Check compliance
    console.log(chalk.bold.yellow('\n▶ Checking compliance against thresholds...\n'));
    const checker = new ComplianceChecker(config);
    const complianceResult = checker.check(auditResults);

    // Display results
    displayResults(auditResults, complianceResult);

    // Step 3: Generate reports
    console.log(chalk.bold.yellow('\n▶ Generating reports...\n'));
    const reportGen = new ReportGenerator(config);
    const jsonReport = await reportGen.generateReport(auditResults);
    const htmlReport = await reportGen.generateHTMLReport(auditResults);

    console.log(
      chalk.green(`✓ JSON Report: ${jsonReport.filepath}`)
    );
    console.log(
      chalk.green(`✓ HTML Report: ${htmlReport}`)
    );

    // Step 4: Send CI/CD notification
    if (config.notificationWebhook) {
      console.log(chalk.bold.yellow('\n▶ Sending CI/CD notification...\n'));
      await checker.notifyCI(complianceResult, auditResults);
      console.log(chalk.green('✓ Notification sent'));
    }

    // Step 5: Determine exit code
    console.log(chalk.bold.cyan('\n═══════════════════════════════════════\n'));

    if (complianceResult.passed) {
      console.log(chalk.bold.green('✓ AUDIT PASSED - Ready for deployment\n'));
      process.exit(0);
    } else {
      console.log(chalk.bold.red('✗ AUDIT FAILED - Deployment blocked\n'));
      console.log(chalk.yellow('Required Actions:'));
      complianceResult.report.summary.forEach((msg) => {
        console.log(chalk.red(`  ${msg}`));
      });
      console.log('');
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.bold.red('\n✗ AUDIT ERROR\n'));
    console.error(chalk.red(`Error: ${error.message}\n`));
    logger.error('Audit failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

/**
 * Display audit results in console
 */
function displayResults(auditResults, complianceResult) {
  const summary = auditResults.summary;

  console.log(chalk.bold.cyan('📊 AUDIT RESULTS\n'));
  console.log(
    `  Status:           ${
      auditResults.status === 'PASSED'
        ? chalk.green.bold('PASSED')
        : chalk.red.bold('FAILED')
    }`
  );
  console.log(`  Compliance Score: ${chalk.bold(auditResults.compliance + '%')}`);
  console.log(`  URL:              ${auditResults.url}\n`);

  console.log(chalk.bold.cyan('📋 ISSUE SUMMARY\n'));
  console.log(`  ${chalk.bold('Total Issues:')}     ${summary.total}`);
  console.log(`  ${chalk.red.bold('Critical:')}     ${summary.critical}/${config.maxCriticalIssues}`);
  console.log(`  ${chalk.yellow.bold('Serious:')}      ${summary.serious}/${config.maxSeriousIssues}`);
  console.log(`  ${chalk.blue.bold('Moderate:')}     ${summary.moderate}`);
  console.log(`  ${chalk.green.bold('Minor:')}        ${summary.minor}\n`);

  console.log(chalk.bold.cyan('✔ COMPLIANCE CHECKS\n'));
  complianceResult.report.summary.forEach((msg) => {
    if (msg.includes('✓')) {
      console.log(chalk.green(`  ${msg}`));
    } else {
      console.log(chalk.red(`  ${msg}`));
    }
  });
  console.log('');
}

// Run the audit
main();
