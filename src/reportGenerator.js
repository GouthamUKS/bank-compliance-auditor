import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Report Generator - Creates compliance reports
 */
export class ReportGenerator {
  constructor(config) {
    this.config = config;
    this.ensureOutputDir();
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir() {
    const outputDir = path.join(__dirname, '..', this.config.reportOutputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logger.info(`Created report output directory: ${outputDir}`);
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateReport(auditResults) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `compliance-report-${timestamp}.json`;
      const filepath = path.join(
        __dirname,
        '..',
        this.config.reportOutputDir,
        filename
      );

      const report = this._buildReport(auditResults);

      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      logger.info(`Report generated: ${filepath}`);

      return {
        filepath,
        report,
      };
    } catch (error) {
      logger.error(`Failed to generate report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build comprehensive report structure
   * @private
   */
  _buildReport(auditResults) {
    const now = new Date();

    return {
      metadata: {
        title: 'Accessibility & Compliance Audit Report',
        generatedAt: now.toISOString(),
        generatedBy: 'Bank Compliance Auditor v1.0.0',
        organization: 'Banking Institution',
        auditType: 'WCAG 2.1 Compliance',
      },
      configuration: {
        wcagVersion: this.config.wcagVersion,
        wcagLevel: this.config.wcagLevel,
        maxCriticalIssues: this.config.maxCriticalIssues,
        maxSeriousIssues: this.config.maxSeriousIssues,
        maxModerateIssues: this.config.maxModerateIssues,
      },
      auditResults: {
        url: auditResults.url,
        timestamp: auditResults.timestamp,
        status: auditResults.status,
        complianceScore: auditResults.compliance,
      },
      summary: {
        total_issues: auditResults.summary.total,
        critical: auditResults.summary.critical,
        serious: auditResults.summary.serious,
        moderate: auditResults.summary.moderate,
        minor: auditResults.summary.minor,
      },
      issues: auditResults.issues,
      recommendations: this._generateRecommendations(auditResults),
      legal_compliance: {
        wcag_2_1_level_aa: auditResults.summary.critical === 0,
        ada_compliant: auditResults.summary.critical === 0,
        section_508_compliant:
          auditResults.summary.critical === 0 && auditResults.summary.serious <= 2,
      },
      certification: {
        passed: auditResults.status === 'PASSED',
        certificationLevel: this._getCertificationLevel(auditResults),
        validUntil: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  /**
   * Generate recommendations for fixing issues
   * @private
   */
  _generateRecommendations(auditResults) {
    const recommendations = [];

    if (auditResults.summary.critical > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: `${auditResults.summary.critical} critical accessibility issues found`,
        action: 'IMMEDIATE: Fix all critical issues before deployment',
        impact: 'Legal compliance, user access blocked',
      });
    }

    if (auditResults.summary.serious > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: `${auditResults.summary.serious} serious accessibility issues found`,
        action: 'Fix serious issues within 2 weeks',
        impact: 'Significant accessibility barriers for users',
      });
    }

    if (auditResults.summary.moderate > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: `${auditResults.summary.moderate} moderate accessibility issues found`,
        action: 'Fix moderate issues within 30 days',
        impact: 'Minor accessibility challenges for some users',
      });
    }

    // Add specific technical recommendations
    auditResults.issues.critical.slice(0, 3).forEach((issue) => {
      recommendations.push({
        priority: 'CRITICAL',
        issue: issue.message,
        wcagCriteria: issue.wcagCriteria,
        action: `Fix: ${this._getFixSuggestion(issue.code)}`,
        affectedElement: issue.selector,
      });
    });

    return recommendations;
  }

  /**
   * Generate fix suggestions based on issue code
   * @private
   */
  _getFixSuggestion(code) {
    const suggestions = {
      'image-alt': 'Add descriptive alt text to all images',
      'color-contrast': 'Increase color contrast ratio to at least 4.5:1 for AA compliance',
      'heading-order': 'Use proper heading hierarchy (h1, h2, h3, etc.)',
      'label': 'Associate form labels with inputs using for/id attributes',
      'button-name': 'Ensure all buttons have accessible names',
      'link-name': 'Provide meaningful link text (avoid "click here")',
      'form-field-multiple-labels': 'Use only one label per form field',
      'duplicate-id': 'Remove duplicate ID attributes from elements',
      'aria-required-attr': 'Add required ARIA attributes',
      'aria-valid-attr': 'Use valid ARIA attribute values',
      'select-name': 'Add accessible names to select elements',
      'textarea-name': 'Add accessible names to textarea elements',
    };
    return suggestions[code] || 'Review WCAG 2.1 guidelines for this issue type';
  }

  /**
   * Determine certification level
   * @private
   */
  _getCertificationLevel(auditResults) {
    const compliance = auditResults.compliance;
    if (compliance >= 95) return 'Gold - Excellent Accessibility';
    if (compliance >= 85) return 'Silver - Good Accessibility';
    if (compliance >= 70) return 'Bronze - Fair Accessibility';
    return 'Non-Compliant';
  }

  /**
   * Generate HTML report for visual inspection
   */
  async generateHTMLReport(auditResults) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `compliance-report-${timestamp}.html`;
      const filepath = path.join(
        __dirname,
        '..',
        this.config.reportOutputDir,
        filename
      );

      const html = this._buildHTMLReport(auditResults);

      fs.writeFileSync(filepath, html);
      logger.info(`HTML Report generated: ${filepath}`);

      return filepath;
    } catch (error) {
      logger.error(`Failed to generate HTML report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build HTML report structure
   * @private
   */
  _buildHTMLReport(auditResults) {
    const statusColor =
      auditResults.status === 'PASSED' ? '#2ecc71' : '#e74c3c';
    const statusText = auditResults.status === 'PASSED' ? '✓ PASSED' : '✗ FAILED';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility & Compliance Audit Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        header h1 { font-size: 2.5em; margin-bottom: 10px; }
        header p { font-size: 1.1em; opacity: 0.9; }
        
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background: ${statusColor};
            color: white;
            border-radius: 4px;
            font-weight: bold;
            font-size: 1.2em;
            margin: 10px 0;
        }
        
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }
        
        .metric-card h3 { color: #667eea; margin-bottom: 5px; }
        .metric-card .value { font-size: 2em; font-weight: bold; color: #333; }
        
        .critical { border-left-color: #e74c3c; }
        .critical .value { color: #e74c3c; }
        
        .serious { border-left-color: #f39c12; }
        .serious .value { color: #f39c12; }
        
        .section {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            color: #667eea;
            margin-bottom: 15px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        
        .issue {
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid #ccc;
            border-radius: 4px;
        }
        
        .issue.critical { border-left-color: #e74c3c; background: #ffebee; }
        .issue.serious { border-left-color: #f39c12; background: #fff3e0; }
        .issue.moderate { border-left-color: #3498db; background: #e3f2fd; }
        .issue.minor { border-left-color: #2ecc71; background: #e8f5e9; }
        
        .issue-code { font-family: monospace; font-weight: bold; color: #667eea; }
        .issue-selector { font-family: monospace; color: #666; font-size: 0.9em; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #f5f5f5; padding: 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        
        .compliance-badge {
            display: inline-block;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
            text-align: center;
            margin: 10px 0;
        }
        
        .compliance-badge .score { font-size: 3em; font-weight: bold; }
        .compliance-badge .label { opacity: 0.9; }
        
        footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔐 Accessibility & Compliance Audit</h1>
            <p>WCAG 2.1 ${this.config.wcagLevel} Compliance Report</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <div class="status-badge">${statusText}</div>
        </header>

        <div class="compliance-badge">
            <div class="score">${auditResults.compliance}%</div>
            <div class="label">Compliance Score</div>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <h3>Total Issues</h3>
                <div class="value">${auditResults.summary.total}</div>
            </div>
            <div class="metric-card critical">
                <h3>Critical</h3>
                <div class="value">${auditResults.summary.critical}</div>
            </div>
            <div class="metric-card serious">
                <h3>Serious</h3>
                <div class="value">${auditResults.summary.serious}</div>
            </div>
            <div class="metric-card">
                <h3>Moderate</h3>
                <div class="value">${auditResults.summary.moderate}</div>
            </div>
        </div>

        ${this._generateIssuesHTML(auditResults)}

        <div class="section">
            <h2>📋 Recommendations</h2>
            ${this._generateRecommendations(auditResults)
              .map(
                (rec) => `
                <div class="issue ${rec.priority.toLowerCase()}">
                    <div><strong>${rec.priority}:</strong> ${rec.issue}</div>
                    <div><strong>Action:</strong> ${rec.action}</div>
                    ${rec.wcagCriteria ? `<div><strong>WCAG:</strong> ${rec.wcagCriteria}</div>` : ''}
                </div>
            `
              )
              .join('')}
        </div>

        <footer>
            <p>This report was generated by Bank Compliance Auditor</p>
            <p>For compliance support, contact your accessibility team</p>
        </footer>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate issues HTML
   * @private
   */
  _generateIssuesHTML(auditResults) {
    const { issues } = auditResults;
    const sections = [];

    if (issues.critical.length > 0) {
      sections.push(this._createIssueSection('CRITICAL', issues.critical));
    }
    if (issues.serious.length > 0) {
      sections.push(this._createIssueSection('SERIOUS', issues.serious));
    }
    if (issues.moderate.length > 0) {
      sections.push(this._createIssueSection('MODERATE', issues.moderate));
    }
    if (issues.minor.length > 0) {
      sections.push(this._createIssueSection('MINOR', issues.minor));
    }

    return sections.join('');
  }

  /**
   * Create issue section HTML
   * @private
   */
  _createIssueSection(level, issues) {
    return `
        <div class="section">
            <h2>${level} Issues (${issues.length})</h2>
            ${issues
              .map(
                (issue) => `
                <div class="issue ${level.toLowerCase()}">
                    <div><span class="issue-code">${issue.code}</span></div>
                    <div><strong>${issue.message}</strong></div>
                    <div><strong>WCAG:</strong> ${issue.wcagCriteria}</div>
                    <div><span class="issue-selector">Selector: ${issue.selector || 'N/A'}</span></div>
                </div>
            `
              )
              .join('')}
        </div>
    `;
  }
}

export default ReportGenerator;
