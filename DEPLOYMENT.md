# 🚀 Deployment Guide

Complete guide to deploying the Bank Compliance Auditor in production.

## Quick Start (Docker Compose)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the application
docker-compose up -d

# 3. Access the dashboard
open http://localhost:3000
```

### Stop the application

```bash
docker-compose down
```

## Deployment Options

### Option 1: Docker (Recommended)

#### Requirements
- Docker 20.10+
- Docker Compose 2.0+

#### Build & Run

```bash
# Build the image
docker build -t bank-auditor:latest .

# Run the container
docker run -d \
  --name bank-auditor \
  -p 3000:3000 \
  -e AUDIT_URL=https://your-app.com \
  -v $(pwd)/reports:/app/reports \
  -v $(pwd)/logs:/app/logs \
  bank-auditor:latest
```

#### Docker Compose (Production)

```yaml
# docker-compose.yml (already provided)
version: '3.8'

services:
  auditor:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AUDIT_URL=https://your-app.com
      - NODE_ENV=production
    volumes:
      - ./reports:/app/reports
      - ./logs:/app/logs
    restart: always
```

**Deploy:**
```bash
docker-compose up -d
```

### Option 2: Heroku

#### Setup

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create app
heroku create bank-auditor

# Set environment variables
heroku config:set AUDIT_URL=https://your-app.com
heroku config:set WCAG_LEVEL=AA
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Option 3: AWS EC2

#### 1. Launch EC2 Instance

```bash
# Create Ubuntu 20.04 LTS instance (t2.medium minimum)
# Security group: Allow 80, 443, 22

# SSH into instance
ssh -i key.pem ubuntu@your-instance-ip
```

#### 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. Install Git & Clone

```bash
sudo apt-get install git
git clone https://github.com/your-org/bank-auditor.git
cd bank-auditor
```

#### 4. Install Dependencies

```bash
npm ci
```

#### 5. Setup Environment

```bash
cp .env.example .env
# Edit .env with your settings
nano .env
```

#### 6. Setup PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 start src/server.js --name "bank-auditor"
pm2 startup
pm2 save
```

#### 7. Setup Nginx Reverse Proxy

```bash
sudo apt-get install nginx
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo systemctl restart nginx
```

#### 8. Setup SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
# Update nginx.conf with certificate paths
```

### Option 4: Kubernetes

#### Create Deployment YAML

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bank-auditor
  labels:
    app: bank-auditor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bank-auditor
  template:
    metadata:
      labels:
        app: bank-auditor
    spec:
      containers:
      - name: auditor
        image: bank-auditor:latest
        ports:
        - containerPort: 3000
        env:
        - name: AUDIT_URL
          valueFrom:
            configMapKeyRef:
              name: auditor-config
              key: audit-url
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: bank-auditor-service
spec:
  selector:
    app: bank-auditor
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

#### Deploy to Kubernetes

```bash
# Create config map
kubectl create configmap auditor-config \
  --from-literal=audit-url=https://your-app.com

# Deploy
kubectl apply -f deployment.yaml

# Check status
kubectl get pods
kubectl logs -f deployment/bank-auditor
```

### Option 5: AWS Lambda + API Gateway

#### Create Handler

```javascript
// handler.js
import AccessibilityAuditor from './src/auditor.js';
import config from './src/config.js';

export const handler = async (event) => {
  try {
    const { url } = JSON.parse(event.body);
    const auditor = new AccessibilityAuditor(config);
    const results = await auditor.audit(url);

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

#### Deploy with Serverless Framework

```bash
npm install -g serverless
serverless deploy
```

## Environment Variables (Production)

```env
# Core Settings
NODE_ENV=production
PORT=3000

# Audit Settings
AUDIT_URL=https://your-banking-app.com
WCAG_LEVEL=AA
WCAG_VERSION=2.1

# Thresholds
MAX_CRITICAL_ISSUES=0
MAX_SERIOUS_ISSUES=5
MAX_MODERATE_ISSUES=15

# Compliance
FAIL_ON_CRITICAL=true
FAIL_ON_SERIOUS=true

# Logging
LOG_LEVEL=error
LOG_FILE=/var/log/auditor.log

# API Security
API_KEY=<encrypted-key>
API_SECRET=<encrypted-secret>

# Notifications
NOTIFICATION_WEBHOOK=<slack-webhook-url>

# Reports
REPORT_OUTPUT_DIR=/data/reports
REPORT_RETENTION_DAYS=90
```

## Health Checks

### Kubernetes

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Docker

```bash
docker-compose up -d
docker-compose exec auditor curl http://localhost:3000/api/health
```

### Manual

```bash
curl http://localhost:3000/api/health
# Response: {"status":"ok","message":"Auditor API running"}
```

## Monitoring & Logging

### View Logs (Docker Compose)

```bash
docker-compose logs -f auditor
```

### View Logs (Kubernetes)

```bash
kubectl logs -f deployment/bank-auditor
```

### Setup ELK Stack (Elasticsearch, Logstash, Kibana)

```yaml
# docker-compose.yml with ELK
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

## Scaling

### Docker Compose (Multiple Instances)

```yaml
services:
  auditor:
    build: .
    deploy:
      replicas: 3
```

### Kubernetes (Horizontal Pod Autoscaling)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bank-auditor-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bank-auditor
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Security in Production

### 1. API Key Protection

```env
# Use environment variables (never in code)
API_KEY=<from-vault>
API_SECRET=<from-vault>

# Rotate keys regularly (every 90 days)
```

### 2. SSL/TLS Certificates

```bash
# Let's Encrypt (free)
certbot certonly --standalone -d your-domain.com

# Commercial (GoDaddy, DigiCert, etc.)
# Purchase and configure in nginx/reverse proxy
```

### 3. Network Security

```bash
# Only expose port 443 (HTTPS)
# Firewall rules:
# - Allow 443 (HTTPS)
# - Allow 22 (SSH) from specific IPs
# - Deny all other ports
```

### 4. Database Security (if using)

```bash
# Use separate database user with limited permissions
# Enable encryption at rest
# Regular backups
```

## Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
tar -czf backups/reports_$TIMESTAMP.tar.gz reports/
tar -czf backups/logs_$TIMESTAMP.tar.gz logs/

# Keep last 30 days
find backups/ -mtime +30 -delete
```

### Setup Cron Job

```bash
0 2 * * * /app/backup.sh
```

## Performance Optimization

### 1. Enable Caching

```javascript
// In server.js
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

### 2. Compression

```javascript
import compression from 'compression';
app.use(compression());
```

### 3. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

## Monitoring

### Datadog Integration

```bash
npm install --save dd-trace

# In server.js
const tracer = require('dd-trace').init();
```

### New Relic Integration

```bash
npm install --save newrelic
# Create newrelic.js config
require('newrelic');
```

## Rollback Strategy

### Blue-Green Deployment

```bash
# Maintain two production environments
# Blue (current)
docker ps | grep bank-auditor-blue

# Green (new version)
docker ps | grep bank-auditor-green

# Switch traffic
# If issues, rollback immediately
```

## Upgrade Process

### Zero-Downtime Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Build new image
docker build -t bank-auditor:v2 .

# 3. Start new container
docker run -d --name bank-auditor-v2 ...

# 4. Switch load balancer
# (point to new container)

# 5. Remove old container
docker stop bank-auditor-v1
```

---

**For questions about deployment, check the CI-CD-SETUP.md guide or SECURITY.md for security best practices.**
