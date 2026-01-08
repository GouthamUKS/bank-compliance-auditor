import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import AccessibilityAuditor from './auditor.js';
import ReportGenerator from './reportGenerator.js';
import ComplianceChecker from './complianceChecker.js';
import config from './config.js';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// In-memory storage for latest results (in production, use database)
let latestAudit = null;
let auditHistory = [];

/**
 * API Routes
 */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auditor API running' });
});

// Get latest audit results
app.get('/api/audit/latest', (req, res) => {
  if (!latestAudit) {
    return res.status(404).json({ error: 'No audit results available' });
  }
  res.json(latestAudit);
});

// Get audit history
app.get('/api/audit/history', (req, res) => {
  res.json(auditHistory.slice(-20)); // Last 20 audits
});

// Get specific audit by ID
app.get('/api/audit/:id', (req, res) => {
  const audit = auditHistory.find((a) => a.id === req.params.id);
  if (!audit) {
    return res.status(404).json({ error: 'Audit not found' });
  }
  res.json(audit);
});

// Run new audit
app.post('/api/audit/run', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    logger.info(`API request to audit: ${url}`);

    // Run audit
    const auditor = new AccessibilityAuditor(config);
    const auditResults = await auditor.audit(url);

    // Check compliance
    const checker = new ComplianceChecker(config);
    const complianceResult = checker.check(auditResults);

    // Generate reports
    const reportGen = new ReportGenerator(config);
    const jsonReport = await reportGen.generateReport(auditResults);

    // Create audit record
    const auditRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      url,
      status: auditResults.status,
      complianceScore: auditResults.compliance,
      summary: auditResults.summary,
      compliancePassed: complianceResult.passed,
      reportPath: jsonReport.filepath,
    };

    // Store results
    latestAudit = auditRecord;
    auditHistory.push(auditRecord);

    res.json({
      success: true,
      audit: auditRecord,
      compliance: complianceResult,
      auditDetails: auditResults,
    });
  } catch (error) {
    logger.error(`Audit API error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Get compliance thresholds
app.get('/api/config/thresholds', (req, res) => {
  res.json({
    wcagLevel: config.wcagLevel,
    maxCriticalIssues: config.maxCriticalIssues,
    maxSeriousIssues: config.maxSeriousIssues,
    maxModerateIssues: config.maxModerateIssues,
  });
});

// Get available reports
app.get('/api/reports', (req, res) => {
  try {
    const reportsDir = path.join(__dirname, '..', config.reportOutputDir);
    if (!fs.existsSync(reportsDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(reportsDir).filter((f) => f.endsWith('.json'));
    const reports = files.map((file) => ({
      name: file,
      path: `/reports/${file}`,
      created: fs.statSync(path.join(reportsDir, file)).mtime,
    }));

    res.json(reports.sort((a, b) => b.created - a.created));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download report
app.get('/reports/:filename', (req, res) => {
  try {
    const filepath = path.join(
      __dirname,
      '..',
      config.reportOutputDir,
      req.params.filename
    );

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.download(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for SPA routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(`Express error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🔐 Accessibility Auditor API running on http://localhost:${PORT}`);
  console.log(`\n📊 Dashboard: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api\n`);
});

export default app;
