# 🚀 CI/CD Setup Guide

Complete guide to setting up GitHub Actions for continuous accessibility compliance.

## 📋 Quick Setup

### Step 1: Add GitHub Secrets (2 minutes)

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these secrets:

```
Name: AUDIT_URL
Value: https://your-banking-app.com

Name: API_KEY
Value: your_encrypted_api_key_here

Name: API_SECRET
Value: your_encrypted_api_secret_here

Name: SLACK_WEBHOOK
Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 2: Verify Workflow File

The workflow file is already created at:
```
.github/workflows/accessibility-audit.yml
```

### Step 3: Trigger Your First Audit

```bash
git push origin main
```

GitHub Actions will automatically:
- ✅ Run accessibility audit
- ✅ Check compliance thresholds
- ✅ Generate reports
- ✅ Comment on PR (if from PR)
- ✅ Send Slack notification

## 🔄 Workflow Configuration

### Trigger Events

The pipeline runs on:

```yaml
on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop
  schedule:
    # Daily at 2 AM UTC
    - cron: '0 2 * * *'
```

**When Does It Run?**
- ✅ When you push to main/develop
- ✅ When PR targets main/develop
- ✅ Every day at 2 AM UTC

### Customizing Triggers

```yaml
# Run only on main branch
on:
  push:
    branches:
      - main

# Run on specific file changes
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'

# Manual trigger via GitHub UI
on:
  workflow_dispatch
```

## 📊 Workflow Jobs

### Job: accessibility-audit

**Timeout:** 30 minutes
**Runs on:** Ubuntu latest
**Steps:**

1. **Checkout code** - Fetches your repository
2. **Setup Node.js** - Configures Node.js 18
3. **Load environment** - Injects GitHub Secrets as env vars
4. **Install deps** - Runs `npm ci`
5. **Run audit** - Executes accessibility audit
6. **Check compliance** - Validates against thresholds
7. **Upload reports** - Saves reports as artifacts
8. **Comment PR** - Posts results on pull requests
9. **Fail if compliance** - Blocks deployment if failed
10. **Send notification** - Notifies Slack

## 📈 Monitoring & Reporting

### Artifacts

Reports are uploaded as artifacts:

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: accessibility-reports
    path: reports/
    retention-days: 30
```

**Access Reports:**
1. Go to GitHub Actions
2. Click the workflow run
3. Scroll to "Artifacts"
4. Download `accessibility-reports`

### PR Comments

Automatic comments on pull requests:

```markdown
## 🔐 Accessibility Audit Report

### 📊 Summary
- **Status**: PASSED
- **Compliance Score**: 92%
- **Total Issues**: 8

### 📋 Issue Breakdown
- 🔴 Critical: 0
- 🟠 Serious: 2
- 🟡 Moderate: 4
- 🟢 Minor: 2

### 📝 Details
See the artifacts tab for detailed reports.
```

### Slack Notifications

Get real-time notifications in Slack:

```json
{
  "attachments": [
    {
      "color": "#2ecc71",
      "title": "✅ Accessibility Audit Status",
      "fields": [
        {
          "title": "Repository",
          "value": "owner/repo"
        },
        {
          "title": "Branch",
          "value": "main"
        },
        {
          "title": "Compliance Score",
          "value": "92%"
        }
      ]
    }
  ]
}
```

## 🚀 Deployment Integration

### Blocking Deployments

If compliance fails, deployment is blocked:

```yaml
- name: 🚨 Fail if compliance check failed
  if: steps.compliance.outcome == 'failure'
  run: |
    echo "❌ Accessibility compliance check FAILED"
    echo "Deployment is BLOCKED until compliance issues are resolved"
    exit 1
```

**Exit Code: 1 → Pipeline Fails → Deployment Blocked**

### Success Deployment

If compliance passes:

```yaml
- name: ✅ Success notification
  if: success()
  run: |
    echo "✅ All accessibility checks passed!"
    echo "✓ Deployment is approved"
```

**Exit Code: 0 → Pipeline Succeeds → Deployment Allowed**

## 📋 Environment Variables in CI/CD

### Automatic Secret Loading

The workflow creates `.env` from secrets:

```yaml
- name: 🔑 Load environment variables
  run: |
    cat > .env << EOF
    AUDIT_URL=${{ secrets.AUDIT_URL }}
    API_KEY=${{ secrets.API_KEY }}
    API_SECRET=${{ secrets.API_SECRET }}
    WCAG_LEVEL=AA
    WCAG_VERSION=2.1
    MAX_CRITICAL_ISSUES=0
    MAX_SERIOUS_ISSUES=5
    FAIL_ON_CRITICAL=true
    FAIL_ON_SERIOUS=true
    NODE_ENV=production
    STRICT_MODE=true
    NOTIFICATION_WEBHOOK=${{ secrets.SLACK_WEBHOOK }}
    EOF
    echo "✓ Environment variables loaded from secrets"
```

### Security Notes

✅ **Secrets are masked** in logs
✅ **Not visible** in workflow output
✅ **Auto-deleted** after job completes
❌ **Never** committed to git

## 🔧 Customizing the Workflow

### Change Audit URL Dynamically

```yaml
# For different branches
env:
  AUDIT_URL: ${{ github.ref == 'refs/heads/main' && secrets.PROD_URL || secrets.STAGING_URL }}
```

### Change Thresholds

```yaml
# More strict for main branch
env:
  MAX_CRITICAL_ISSUES: ${{ github.ref == 'refs/heads/main' && '0' || '2' }}
  MAX_SERIOUS_ISSUES: ${{ github.ref == 'refs/heads/main' && '3' || '10' }}
```

### Run Only on Main

```yaml
on:
  push:
    branches:
      - main
```

### Run on Specific Times

```yaml
schedule:
  # Every Monday at 9 AM UTC
  - cron: '0 9 * * 1'
  
  # Every 6 hours
  - cron: '0 */6 * * *'
```

## 🐛 Debugging Workflow

### View Logs

1. Go to GitHub Actions
2. Click the failed workflow
3. Click the job name
4. Scroll to see step-by-step logs

### Enable Debug Logging

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

### Check Environment

```yaml
- name: Debug environment
  run: |
    echo "Node version:"
    node --version
    echo "NPM version:"
    npm --version
    echo "Current directory:"
    pwd
    echo "Files:"
    ls -la
```

## 📊 Troubleshooting

### "Compliance check failed"

**Problem:** Accessibility issues found
**Solution:** Review audit results in artifacts
```bash
1. Download accessibility-reports artifact
2. Open compliance-report-*.json
3. Fix issues in the "serious" or "critical" arrays
4. Push fix
5. GitHub Actions re-runs automatically
```

### "AUDIT_URL not found"

**Problem:** Secret not set
**Solution:**
```bash
1. Go to Settings → Secrets
2. Verify AUDIT_URL secret exists
3. Check spelling matches
4. Re-run workflow
```

### "npm install failed"

**Problem:** Dependency installation failed
**Solution:**
```yaml
- name: Clear npm cache
  run: npm cache clean --force
  
- name: Install again
  run: npm ci
```

### "Slack webhook failed"

**Problem:** Slack notification didn't send
**Solution:**
```bash
1. Check webhook URL in SLACK_WEBHOOK secret
2. Verify it's a valid Slack webhook
3. Test with curl:
   curl -X POST -H 'Content-type: application/json' \
   --data '{"text":"Test"}' $SLACK_WEBHOOK
```

## 📈 Best Practices

### 1. Run Locally First

```bash
# Test your changes locally
npm run audit

# Then push
git push origin main
```

### 2. Set Realistic Thresholds

```env
# Don't set threshold too high
MAX_CRITICAL_ISSUES=0    # ✅ Good
MAX_SERIOUS_ISSUES=5     # ✅ Good

# Don't set too restrictive initially
MAX_CRITICAL_ISSUES=10   # ❌ Too lenient
```

### 3. Review Reports Regularly

- Check artifacts weekly
- Track compliance score trends
- Address issues early

### 4. Keep Workflow Updated

```bash
# When dependencies update
npm update

# Commit and push
git push origin main
```

### 5. Monitor Slack Channel

Set up a dedicated #accessibility-audits channel for notifications

## 🎯 Example Workflow Customization

```yaml
name: Custom Accessibility Audit
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: |
          cat > .env << EOF
          AUDIT_URL=${{ secrets.AUDIT_URL }}
          WCAG_LEVEL=AA
          FAIL_ON_CRITICAL=true
          EOF
      
      - run: npm ci
      - run: npm run audit
      - run: npm run ci:audit
      
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: reports
          path: reports/
```

## ✅ Setup Verification Checklist

- [ ] GitHub Secrets added (AUDIT_URL, API_KEY, etc.)
- [ ] Workflow file exists at `.github/workflows/accessibility-audit.yml`
- [ ] Local audit runs successfully: `npm run audit`
- [ ] Push triggers GitHub Actions
- [ ] Workflow completes and generates reports
- [ ] PR comments include audit results
- [ ] Slack webhook posts notifications
- [ ] Failed audit blocks deployment
- [ ] Artifacts upload correctly
- [ ] Team notified of results

## 📞 Support

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Slack Webhooks:** https://api.slack.com/messaging/webhooks
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

**Your CI/CD pipeline is now protecting your banking application's accessibility!**
