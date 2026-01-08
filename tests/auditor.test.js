import assert from 'assert';
import { AccessibilityAuditor } from '../src/auditor.js';

describe('AccessibilityAuditor', () => {
  let auditor;
  const config = {
    wcagLevel: 'AA',
    wcagVersion: '2.1',
    maxCriticalIssues: 0,
    maxSeriousIssues: 5,
    maxModerateIssues: 15,
    failOnSerious: true,
  };

  before(() => {
    auditor = new AccessibilityAuditor(config);
  });

  describe('WCAG Level Mapping', () => {
    it('should correctly map WCAG levels for known issues', () => {
      assert.strictEqual(auditor._getWCAGLevel('image-alt'), 'A');
      assert.strictEqual(auditor._getWCAGLevel('color-contrast'), 'AA');
      assert.strictEqual(auditor._getWCAGLevel('heading-order'), 'A');
    });

    it('should return AA for unknown issues', () => {
      assert.strictEqual(auditor._getWCAGLevel('unknown-code'), 'AA');
    });
  });

  describe('WCAG Criteria Retrieval', () => {
    it('should return proper WCAG criteria for known issues', () => {
      const criteria = auditor._getWCAGCriteria('image-alt');
      assert(criteria.includes('1.1.1'));
      assert(criteria.includes('Non-text Content'));
    });

    it('should return generic criteria for unknown issues', () => {
      const criteria = auditor._getWCAGCriteria('unknown-code');
      assert(criteria.includes('WCAG 2.1'));
    });
  });

  describe('Status Determination', () => {
    it('should return FAILED when critical issues exceed threshold', () => {
      const issues = {
        critical: [{ message: 'test' }],
        serious: [],
        moderate: [],
        minor: [],
      };
      assert.strictEqual(auditor._determineStatus(issues), 'FAILED');
    });

    it('should return FAILED when serious issues exceed threshold', () => {
      const issues = {
        critical: [],
        serious: Array(10).fill({ message: 'test' }),
        moderate: [],
        minor: [],
      };
      assert.strictEqual(auditor._determineStatus(issues), 'FAILED');
    });

    it('should return PASSED when issues are within thresholds', () => {
      const issues = {
        critical: [],
        serious: [{ message: 'test' }],
        moderate: [],
        minor: [],
      };
      assert.strictEqual(auditor._determineStatus(issues), 'PASSED');
    });
  });

  describe('Compliance Calculation', () => {
    it('should return 100% for no issues', () => {
      const issues = {
        critical: [],
        serious: [],
        moderate: [],
        minor: [],
      };
      assert.strictEqual(auditor._calculateCompliance(issues), 100);
    });

    it('should calculate lower compliance for more issues', () => {
      const issuesWithCritical = {
        critical: [{ message: 'test' }],
        serious: [],
        moderate: [],
        minor: [],
      };
      const issuesWithMinor = {
        critical: [],
        serious: [],
        moderate: [],
        minor: [{ message: 'test' }],
      };

      const criticalCompliance = auditor._calculateCompliance(issuesWithCritical);
      const minorCompliance = auditor._calculateCompliance(issuesWithMinor);

      assert(criticalCompliance < minorCompliance);
    });
  });
});
