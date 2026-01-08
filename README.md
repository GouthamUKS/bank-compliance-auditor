# 🔐 Bank Compliance & Accessibility Auditor

A production-ready automated accessibility compliance tool for banking applications. Integrates WCAG 2.1 scanning with CI/CD pipelines to ensure accessibility standards before deployment.

## 📋 Features

### ✅ Accessibility Auditing
- **WCAG 2.1 Level AA Compliance** - Full scanning for accessibility violations
- **Axe Engine** - Industry-standard accessibility testing
- **Detailed Issue Classification** - Critical, Serious, Moderate, Minor
- **WCAG Criteria Mapping** - Each issue mapped to specific WCAG criterion

### 🔒 Security & Compliance
- **Environment Variables** - Sensitive API keys protected via `.env`
- **Strict Mode** - Banking-grade security validation
- **API Authentication** - Secure API key management
- **Encrypted Credentials** - Secrets stored securely

### 🚀 CI/CD Integration
- **GitHub Actions Pipeline** - Automated accessibility checks on every push
- **Deployment Gating** - Blocks deployment if compliance fails
- **Pull Request Comments** - Detailed audit reports on PRs
- **Slack Notifications** - Real-time compliance status updates

### 📊 Reporting
- **JSON Reports** - Machine-readable compliance data
- **HTML Reports** - Beautiful visual reports
- **Compliance Score** - Overall accessibility percentage
- **Recommendations** - Specific fix suggestions

## 🏗️ Project Structure

```
Bank App/
├── .github/
│   └── workflows/
│       └── accessibility-audit.yml    # GitHub Actions CI/CD pipeline
├── src/
│   ├── index.js                      # Main entry point
│   ├── config.js                     # Configuration management
│   ├── logger.js                     # Logging system
│   ├── auditor.js                    # Accessibility auditor
│   ├── reportGenerator.js            # Report generation
│   ├── complianceChecker.js          # Compliance validation
│   └── checkCompliance.js            # CI/CD compliance check
├── tests/
│   ├── auditor.test.js              # Auditor tests
│   └── compliance.test.js            # Compliance checker tests
├── reports/                          # Generated audit reports
├── logs/                             # Application logs
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies and scripts
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Slack webhook for notifications

### Installation

1. **Clone or setup the project:**
   ```bash
   cd "Bank App"
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your settings:**
   ```env
   AUDIT_URL=https://your-banking-app.com
   API_KEY=your_secure_api_key_here
   WCAG_LEVEL=AA
   MAX_CRITICAL_ISSUES=0
   MAX_SERIOUS_ISSUES=5
   NODE_ENV=production
   SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

## 📖 Usage

### Local Audit

Run a local accessibility audit:

```bash
npm run audit
```

Or audit a specific URL:

```bash
npm run audit:local -- --url http://localhost:3000
```

### View Reports

After an audit, check the `reports/` directory:
- `compliance-report-*.json` - Detailed JSON report
- `compliance-report-*.html` - Visual HTML report

### Run Tests

```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
```

## 🔐 Environment Variables

Create a `.env` file (never commit this to git):

```env
# Audit Configuration
AUDIT_URL=https://bankapp.example.com

# Security & API Keys (Encrypted in CI/CD)
API_KEY=your_encrypted_api_key
API_SECRET=your_encrypted_api_secret

# WCAG Compliance Thresholds
WCAG_LEVEL=AA
WCAG_VERSION=2.1
MAX_CRITICAL_ISSUES=0
MAX_SERIOUS_ISSUES=5
MAX_MODERATE_ISSUES=15

# CI/CD Configuration
FAIL_ON_CRITICAL=true
FAIL_ON_SERIOUS=true
NOTIFICATION_WEBHOOK=https://hooks.slack.com/services/...

# Environment
NODE_ENV=production
STRICT_MODE=true
```

**Important:** `.env` is in `.gitignore` for security. In CI/CD, use GitHub Secrets.

## 🔄 CI/CD Pipeline (GitHub Actions)

### Setup GitHub Secrets

1. Go to Repository → Settings → Secrets and Variables → Actions
2. Add these secrets:
   - `AUDIT_URL` - Your application URL
   - `API_KEY` - Your API key
   - `API_SECRET` - Your API secret
   - `SLACK_WEBHOOK` - Slack webhook URL (optional)

### How It Works

The pipeline (`.github/workflows/accessibility-audit.yml`):

1. **Trigger Events:**
   - ✅ On push to `main` or `develop`
   - ✅ On pull requests
   - ✅ Daily scheduled run (2 AM UTC)

2. **Execution Steps:**
   - Checkout code
   - Setup Node.js environment
   - Load secrets into environment variables
   - Run accessibility audit
   - Check compliance thresholds
   - Generate reports
   - Comment on PR with results
   - Send Slack notification
   - **Block deployment if compliance fails** ❌

3. **Deployment Blocking:**
   ```
   If compliance fails → Pipeline exits with code 1 → Deployment blocked
   If compliance passes → Pipeline succeeds → Deployment allowed
   ```

### Example: Fail Deployment

```yaml
- name: 🚨 Fail if compliance check failed
  if: steps.compliance.outcome == 'failure'
  run: exit 1  # Stops deployment
```

## 📊 Reports

### JSON Report
Machine-readable format for integration with other tools:

```json
{
  "metadata": {
    "title": "Accessibility & Compliance Audit Report",
    "generatedAt": "2024-01-08T10:30:00Z"
  },
  "auditResults": {
    "status": "PASSED",
    "complianceScore": 92
  },
  "summary": {
    "total_issues": 8,
    "critical": 0,
    "serious": 2,
    "moderate": 4,
    "minor": 2
  },
  "issues": {
    "critical": [],
    "serious": [
      {
        "code": "color-contrast",
        "message": "Insufficient color contrast",
        "wcagLevel": "AA",
        "wcagCriteria": "WCAG 2.1 Level AA - 1.4.3 Contrast (Minimum)"
      }
    ]
  },
  "recommendations": [...]
}
```

### HTML Report
Beautiful visual report for stakeholders:
- 📊 Compliance score visualization
- 📋 Issue breakdown by severity
- 🎯 Specific recommendations
- 📝 WCAG criteria references

## 🧪 Testing

The project includes comprehensive tests:

```bash
# Run tests
npm test

# Watch mode for development
npm run test:watch
```

Test coverage:
- ✅ Auditor WCAG level mapping
- ✅ Compliance threshold validation
- ✅ Status determination logic
- ✅ Report generation
- ✅ Notification formatting

## 🛡️ Security Best Practices

### 1. Environment Variables
✅ **Do:**
- Store API keys in `.env` (not in git)
- Use GitHub Secrets for CI/CD
- Never log sensitive data
- Rotate API keys regularly

❌ **Don't:**
- Commit `.env` files
- Print API keys in logs
- Share secrets in chat
- Use same key for multiple environments

### 2. CI/CD Security
✅ **Implemented:**
- Secrets masked in logs
- HTTPS webhooks only
- API key validation at startup
- Strict mode validation

### 3. Banking Compliance
✅ **Features:**
- WCAG 2.1 Level AA compliance
- ADA Section 508 validation
- Compliance certification
- Legal compliance tracking

## 🔍 Example: Reading Reports

```javascript
// Read the latest report
import fs from 'fs';
import path from 'path';

const reportPath = './reports/compliance-report-2024-01-08.json';
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

console.log(`Status: ${report.auditResults.status}`);
console.log(`Score: ${report.auditResults.complianceScore}%`);
console.log(`Critical Issues: ${report.summary.critical}`);
```

## 📈 Compliance Metrics

### Scoring Breakdown
- **95-100%**: 🥇 Gold - Excellent Accessibility
- **85-94%**: 🥈 Silver - Good Accessibility
- **70-84%**: 🥉 Bronze - Fair Accessibility
- **Below 70%**: 🔴 Non-Compliant

### Thresholds
| Severity | Threshold | Default | Banking Requirement |
|----------|-----------|---------|-------------------|
| Critical | 0 | 0 | Zero tolerance |
| Serious | 5 | 5 | Blocks deployment |
| Moderate | 15 | 15 | Warning only |
| Minor | Unlimited | - | Informational |

## 🚀 Deployment Workflow

```
Developer Push
     ↓
GitHub Actions Triggered
     ↓
Run Accessibility Audit
     ↓
Check Compliance Thresholds
     ↓
┌─────────────────────────┐
│  Compliance Status?     │
└─────────────────────────┘
         ↙              ↖
    PASSED           FAILED
      ↓                ↓
  ✅ APPROVED    ❌ BLOCKED
  Deploy            Notify
                    Team
```

## 📞 Support & Notifications

### Slack Notifications
When configured, Slack receives:
- ✅ Audit status (pass/fail)
- 📊 Compliance scores
- 🔴 Critical issues
- 📝 Recommendations

### Failed Deployment Example
```
❌ AUDIT FAILED - Deployment blocked

Required Actions:
- Fix all critical issues (2 found)
- Reduce serious issues from 8 to max 5
- Add proper heading hierarchy
```

## 🤝 Contributing

When contributing, ensure:
1. All tests pass: `npm test`
2. Audit passes: `npm run audit`
3. Code follows existing style
4. Update documentation

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ADA Compliance](https://www.ada.gov/)
- [Section 508 Standards](https://www.section508.gov/)
- [Axe Accessibility Engine](https://github.com/dequelabs/axe-core)

## 🔐 License

MIT License - Designed for banking and financial institutions

---

**Built with ❤️ for accessible banking applications**
