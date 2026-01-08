import assert from 'assert';
import { ComplianceChecker } from '../src/complianceChecker.js';

describe('ComplianceChecker', () => {
  let checker;
  const config = {
    wcagLevel: 'AA',
    wcagVersion: '2.1',
    maxCriticalIssues: 0,
    maxSeriousIssues: 5,
    maxModerateIssues: 15,
    failOnSerious: true,
  };

  before(() => {
    checker = new ComplianceChecker(config);
  });

  describe('Compliance Checks', () => {
    it('should pass critical issues check when zero issues', () => {
      const auditResults = {
        summary: { critical: 0, serious: 2, moderate: 5, minor: 10, total: 17 },
        compliance: 85,
        status: 'PASSED',
      };

      const result = checker.check(auditResults);
      assert(result.checks.criticalIssues.passed);
    });

    it('should fail critical issues check when threshold exceeded', () => {
      const auditResults = {
        summary: { critical: 1, serious: 2, moderate: 5, minor: 10, total: 18 },
        compliance: 70,
        status: 'FAILED',
      };

      const result = checker.check(auditResults);
      assert(!result.checks.criticalIssues.passed);
    });

    it('should pass serious issues check when within threshold', () => {
      const auditResults = {
        summary: { critical: 0, serious: 3, moderate: 5, minor: 10, total: 18 },
        compliance: 85,
        status: 'PASSED',
      };

      const result = checker.check(auditResults);
      assert(result.checks.seriousIssues.passed);
    });

    it('should fail serious issues check when threshold exceeded', () => {
      const auditResults = {
        summary: { critical: 0, serious: 10, moderate: 5, minor: 10, total: 25 },
        compliance: 60,
        status: 'FAILED',
      };

      const result = checker.check(auditResults);
      assert(!result.checks.seriousIssues.passed);
    });
  });

  describe('Overall Pass/Fail Determination', () => {
    it('should pass when all checks pass', () => {
      const auditResults = {
        summary: { critical: 0, serious: 2, moderate: 5, minor: 10, total: 17 },
        compliance: 85,
        status: 'PASSED',
      };

      const result = checker.check(auditResults);
      assert(result.passed);
    });

    it('should fail when critical check fails', () => {
      const auditResults = {
        summary: { critical: 1, serious: 2, moderate: 5, minor: 10, total: 18 },
        compliance: 70,
        status: 'FAILED',
      };

      const result = checker.check(auditResults);
      assert(!result.passed);
    });

    it('should fail when serious check fails', () => {
      const auditResults = {
        summary: { critical: 0, serious: 8, moderate: 5, minor: 10, total: 23 },
        compliance: 65,
        status: 'FAILED',
      };

      const result = checker.check(auditResults);
      assert(!result.passed);
    });
  });

  describe('Report Generation', () => {
    it('should generate summary messages', () => {
      const auditResults = {
        summary: { critical: 0, serious: 2, moderate: 5, minor: 10, total: 17 },
        compliance: 85,
        status: 'PASSED',
      };

      const result = checker.check(auditResults);
      assert(Array.isArray(result.report.summary));
      assert(result.report.summary.length > 0);
      assert(result.report.summary[0].includes('✓')); // Should have success indicators
    });
  });
});
