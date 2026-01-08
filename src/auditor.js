import pa11y from 'pa11y';
import logger from './logger.js';

/**
 * Accessibility Auditor - WCAG 2.1 Compliance Scanner
 * Scans a website for accessibility violations
 */
export class AccessibilityAuditor {
  constructor(config) {
    this.config = config;
    this.results = null;
  }

  /**
   * Run accessibility audit on a URL
   * @param {string} url - The URL to audit
   * @returns {Promise<Object>} Audit results
   */
  async audit(url) {
    try {
      logger.info(`Starting accessibility audit for: ${url}`);

      const auditResult = await pa11y(url, {
        standard: this.config.wcagLevel,
        include: ['.bank-container', 'main', '.content'],
        runners: ['axe'],
        wait: 5000,
        chromeLaunchConfig: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      });

      this.results = this._processResults(auditResult);
      logger.info(`Audit completed for: ${url}`, {
        issuesFound: this.results.summary.total,
      });

      return this.results;
    } catch (error) {
      logger.error(`Audit failed for ${url}: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Process pa11y results into structured format
   * @private
   */
  _processResults(auditResult) {
    const issues = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    // Categorize issues by type
    auditResult.issues.forEach((issue) => {
      const severityMap = {
        error: 'critical',
        warning: 'serious',
        notice: 'moderate',
        info: 'minor',
      };

      const category = severityMap[issue.type] || 'minor';
      issues[category].push({
        code: issue.code,
        message: issue.message,
        type: issue.type,
        selector: issue.selector,
        wcagLevel: this._getWCAGLevel(issue.code),
        wcagCriteria: this._getWCAGCriteria(issue.code),
      });
    });

    return {
      url: auditResult.documentTitle,
      timestamp: new Date().toISOString(),
      wcagLevel: this.config.wcagLevel,
      wcagVersion: this.config.wcagVersion,
      summary: {
        total: auditResult.issues.length,
        critical: issues.critical.length,
        serious: issues.serious.length,
        moderate: issues.moderate.length,
        minor: issues.minor.length,
      },
      issues,
      status: this._determineStatus(issues),
      compliance: this._calculateCompliance(issues),
    };
  }

  /**
   * Determine audit status based on issues
   * @private
   */
  _determineStatus(issues) {
    if (issues.critical.length > this.config.maxCriticalIssues) {
      return 'FAILED';
    }
    if (
      this.config.failOnSerious &&
      issues.serious.length > this.config.maxSeriousIssues
    ) {
      return 'FAILED';
    }
    return 'PASSED';
  }

  /**
   * Calculate compliance percentage
   * @private
   */
  _calculateCompliance(issues) {
    const total = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);
    if (total === 0) return 100;

    // Weight severity: critical (100 points), serious (50 points), moderate (20 points), minor (5 points)
    const points =
      issues.critical.length * 100 +
      issues.serious.length * 50 +
      issues.moderate.length * 20 +
      issues.minor.length * 5;

    const maxPoints = total * 100;
    return Math.round(((maxPoints - points) / maxPoints) * 100);
  }

  /**
   * Map issue code to WCAG level
   * @private
   */
  _getWCAGLevel(code) {
    const levelMap = {
      'image-alt': 'A',
      'color-contrast': 'AA',
      'heading-order': 'A',
      'label': 'A',
      'button-name': 'A',
      'link-name': 'A',
      'form-field-multiple-labels': 'A',
      'duplicate-id': 'A',
      'aria-required-attr': 'A',
      'aria-valid-attr': 'A',
      'select-name': 'A',
      'textarea-name': 'A',
    };
    return levelMap[code] || 'AA';
  }

  /**
   * Get WCAG criteria details
   * @private
   */
  _getWCAGCriteria(code) {
    const criteriaMap = {
      'image-alt': 'WCAG 2.1 Level A - 1.1.1 Non-text Content',
      'color-contrast': 'WCAG 2.1 Level AA - 1.4.3 Contrast (Minimum)',
      'heading-order': 'WCAG 2.1 Level A - 1.3.1 Info and Relationships',
      'label': 'WCAG 2.1 Level A - 1.3.1 Info and Relationships',
      'button-name': 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value',
      'link-name': 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value',
      'form-field-multiple-labels': 'WCAG 2.1 Level A - 1.3.1 Info and Relationships',
      'duplicate-id': 'WCAG 2.1 Level A - 4.1.1 Parsing',
      'aria-required-attr': 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value',
      'aria-valid-attr': 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value',
      'select-name': 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value',
      'textarea-name': 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value',
    };
    return criteriaMap[code] || 'WCAG 2.1 Level A - General Accessibility';
  }

  /**
   * Check if audit passed compliance thresholds
   */
  isPassed() {
    return this.results && this.results.status === 'PASSED';
  }

  /**
   * Get summary of results
   */
  getSummary() {
    return this.results?.summary || null;
  }

  /**
   * Get detailed issues
   */
  getIssues() {
    return this.results?.issues || null;
  }
}

export default AccessibilityAuditor;
