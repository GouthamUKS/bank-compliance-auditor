import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Compliance Checker - Validates audit results against thresholds
 * Used in CI/CD pipeline to determine pass/fail
 */
export class ComplianceChecker {
  constructor(config) {
    this.config = config;
  }

  /**
   * Check if audit results meet compliance standards
   * @param {Object} auditResults - Audit results from AccessibilityAuditor
   * @returns {Object} Compliance check result
   */
  check(auditResults) {
    const checks = {
      criticalIssues: this._checkCriticalIssues(auditResults),
      seriousIssues: this._checkSeriousIssues(auditResults),
      moderateIssues: this._checkModerateIssues(auditResults),
      wcagCompliance: this._checkWCAGCompliance(auditResults),
      complianceScore: auditResults.compliance,
    };

    const passed = this._determineOverallPass(checks);

    logger.info('Compliance check completed', {
      passed,
      criticalPassed: checks.criticalIssues.passed,
      seriousPassed: checks.seriousIssues.passed,
      scorePercentage: `${checks.complianceScore}%`,
    });

    return {
      passed,
      checks,
      timestamp: new Date().toISOString(),
      report: this._generateComplianceReport(checks),
    };
  }

  /**
   * Check critical issues threshold
   * @private
   */
  _checkCriticalIssues(auditResults) {
    const count = auditResults.summary.critical;
    const passed = count <= this.config.maxCriticalIssues;

    return {
      metric: 'Critical Issues',
      current: count,
      threshold: this.config.maxCriticalIssues,
      passed,
      message: passed
        ? `✓ Critical issues within threshold (${count}/${this.config.maxCriticalIssues})`
        : `✗ Critical issues exceed threshold (${count}/${this.config.maxCriticalIssues})`,
    };
  }

  /**
   * Check serious issues threshold
   * @private
   */
  _checkSeriousIssues(auditResults) {
    const count = auditResults.summary.serious;
    const passed = count <= this.config.maxSeriousIssues;

    return {
      metric: 'Serious Issues',
      current: count,
      threshold: this.config.maxSeriousIssues,
      passed,
      message: passed
        ? `✓ Serious issues within threshold (${count}/${this.config.maxSeriousIssues})`
        : `✗ Serious issues exceed threshold (${count}/${this.config.maxSeriousIssues})`,
    };
  }

  /**
   * Check moderate issues threshold
   * @private
   */
  _checkModerateIssues(auditResults) {
    const count = auditResults.summary.moderate;
    const passed = count <= this.config.maxModerateIssues;

    return {
      metric: 'Moderate Issues',
      current: count,
      threshold: this.config.maxModerateIssues,
      passed,
      message: passed
        ? `✓ Moderate issues within threshold (${count}/${this.config.maxModerateIssues})`
        : `✗ Moderate issues exceed threshold (${count}/${this.config.maxModerateIssues})`,
    };
  }

  /**
   * Check WCAG compliance level
   * @private
   */
  _checkWCAGCompliance(auditResults) {
    const passed = auditResults.summary.critical === 0;

    return {
      metric: 'WCAG 2.1 Level AA Compliance',
      currentLevel: this.config.wcagLevel,
      compliant: passed,
      passed,
      message: passed
        ? `✓ WCAG 2.1 Level ${this.config.wcagLevel} Compliant`
        : `✗ WCAG 2.1 Level ${this.config.wcagLevel} Non-Compliant (${auditResults.summary.critical} critical issues)`,
    };
  }

  /**
   * Determine overall pass/fail
   * @private
   */
  _determineOverallPass(checks) {
    if (!checks.criticalIssues.passed) return false;
    if (this.config.failOnSerious && !checks.seriousIssues.passed) return false;
    return true;
  }

  /**
   * Generate compliance report
   * @private
   */
  _generateComplianceReport(checks) {
    const checkResults = Object.values(checks).filter((check) => check.message);

    return {
      summary: checkResults.map((check) => check.message),
      details: checkResults,
      allChecksPassed: checkResults.every((check) => check.passed),
    };
  }

  /**
   * Send notification to CI/CD webhook (Slack, Teams, etc.)
   * @async
   */
  async notifyCI(complianceResult, auditResults) {
    if (!this.config.notificationWebhook) {
      logger.info('No notification webhook configured');
      return;
    }

    try {
      const message = this._buildNotificationMessage(complianceResult, auditResults);

      await axios.post(this.config.notificationWebhook, message, {
        headers: { 'Content-Type': 'application/json' },
      });

      logger.info('Notification sent to webhook');
    } catch (error) {
      logger.error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Build notification message for Slack/Teams
   * @private
   */
  _buildNotificationMessage(complianceResult, auditResults) {
    const statusEmoji = complianceResult.passed ? '✅' : '❌';
    const statusColor = complianceResult.passed ? '#2ecc71' : '#e74c3c';

    return {
      attachments: [
        {
          color: statusColor,
          title: `${statusEmoji} Accessibility Audit Report`,
          text: complianceResult.passed
            ? 'All compliance checks passed!'
            : 'Compliance check failed - Deployment blocked',
          fields: [
            {
              title: 'Status',
              value: auditResults.status,
              short: true,
            },
            {
              title: 'Compliance Score',
              value: `${auditResults.compliance}%`,
              short: true,
            },
            {
              title: 'Critical Issues',
              value: `${auditResults.summary.critical} (Max: ${this.config.maxCriticalIssues})`,
              short: true,
            },
            {
              title: 'Serious Issues',
              value: `${auditResults.summary.serious} (Max: ${this.config.maxSeriousIssues})`,
              short: true,
            },
            {
              title: 'Total Issues',
              value: auditResults.summary.total.toString(),
              short: true,
            },
            {
              title: 'Checks Summary',
              value: complianceResult.report.summary.join('\n'),
              short: false,
            },
          ],
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };
  }
}

export default ComplianceChecker;
