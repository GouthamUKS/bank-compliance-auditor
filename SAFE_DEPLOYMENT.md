# 🔒 Safe Deployment Guide - V1

Complete instructions for safely deploying Bank Compliance Auditor to production.

## ✅ Pre-Deployment Checklist

- [x] Code committed to GitHub
- [x] Tests passing locally
- [x] Environment variables configured
- [x] Docker image tested
- [x] Security review completed

## 🚀 OPTION 1: Docker (RECOMMENDED - Safest)

### Step 1: Verify Docker Installation
```bash
docker --version
docker-compose --version
```

### Step 2: Build Docker Image
```bash
cd "/Users/gouthamsoratoor/Documents/01_G_Workspace/01_Projects/Bank App"
docker build -t bank-auditor:v1 .
```

### Step 3: Test Locally with Docker Compose
```bash
docker-compose up -d
```

Wait 10 seconds, then verify:
```bash
curl http://localhost:3000
```

Should return HTML dashboard. ✅

### Step 4: Stop Local Test
```bash
docker-compose down
```

### Step 5: Push to Docker Hub (Optional)
```bash
# Login to Docker Hub
docker login

# Tag the image
docker tag bank-auditor:v1 GouthamUKS/bank-auditor:v1

# Push
docker push GouthamUKS/bank-auditor:v1
```

---

## 🌩️ OPTION 2: AWS Deployment (EC2)

### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2 → Instances → Launch Instance
2. Select: **Ubuntu 22.04 LTS** (t3.micro = free tier eligible)
3. Security Group: Allow ports 80, 443, 3000
4. Download key pair (save as `bank-auditor.pem`)

### Step 2: Connect to Instance
```bash
chmod 600 bank-auditor.pem
ssh -i bank-auditor.pem ubuntu@your-ec2-ip
```

### Step 3: Setup on EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Clone your repo
git clone https://github.com/GouthamUKS/bank-compliance-auditor.git
cd bank-compliance-auditor

# Create .env with production values
cp .env.example .env
nano .env  # Edit with your actual values

# Deploy
docker-compose up -d
```

### Step 4: Configure Domain (Optional)
```bash
# Install Nginx
sudo apt install -y nginx

# Configure as reverse proxy (edit /etc/nginx/sites-available/default)
# Point to localhost:3000
```

### Step 5: Setup SSL (Free with Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🚀 OPTION 3: Heroku Deployment (Easiest)

### Step 1: Install Heroku CLI
```bash
brew install heroku
heroku login
```

### Step 2: Create Heroku App
```bash
cd "/Users/gouthamsoratoor/Documents/01_G_Workspace/01_Projects/Bank App"
heroku create bank-auditor-v1
```

### Step 3: Set Environment Variables
```bash
heroku config:set AUDIT_URL=https://bankapp.example.com
heroku config:set NODE_ENV=production
heroku config:set LOG_LEVEL=info
```

### Step 4: Deploy
```bash
git push heroku main
```

### Step 5: Verify
```bash
heroku logs --tail
heroku open
```

---

## 🔐 Security Best Practices

### ✅ DO:
- [x] Keep `.env` out of Git (.gitignore)
- [x] Use GitHub Secrets for CI/CD
- [x] Enable HTTPS/SSL
- [x] Regular security updates
- [x] Monitor logs for errors
- [x] Backup reports and logs

### ❌ DON'T:
- [ ] Commit `.env` to Git
- [ ] Share API keys in code
- [ ] Use weak passwords
- [ ] Skip SSL certificates
- [ ] Ignore security warnings
- [ ] Run in development mode

---

## 📊 Monitoring & Health Checks

### Health Endpoint
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status": "healthy", "uptime": 123456}
```

### View Logs
```bash
# Docker logs
docker-compose logs -f auditor

# Local logs
tail -f logs/accessibility-auditor.log
```

### Check Dashboard
```bash
open http://your-deployed-url:3000
```

---

## 🔄 Update Procedure (V2+)

### Step 1: Make Changes
```bash
# Make code changes locally
# Commit to Git
git add .
git commit -m "V2: Feature updates"
git push origin main
```

### Step 2: Rebuild Docker Image
```bash
docker build -t bank-auditor:v2 .
```

### Step 3: Test Locally
```bash
docker-compose up -d
# Test at http://localhost:3000
docker-compose down
```

### Step 4: Deploy
```bash
# For Heroku
git push heroku main

# For AWS/Docker
docker tag bank-auditor:v2 GouthamUKS/bank-auditor:v2
docker push GouthamUKS/bank-auditor:v2
# Then restart container on server
```

---

## 🆘 Troubleshooting

### Container won't start
```bash
docker-compose logs auditor
# Check error messages
```

### Port already in use
```bash
# Find what's using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Health check fails
```bash
# Check environment variables
docker-compose config

# Verify .env file has correct values
cat .env
```

### Database connection issues
```bash
# Currently using in-memory storage
# For future: update config.js to use MongoDB/PostgreSQL
```

---

## 📈 Scaling (When Needed)

### Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yml bank-auditor
```

### Kubernetes
```bash
# Create deployment
kubectl apply -f deployment.yaml

# Scale pods
kubectl scale deployment bank-auditor --replicas=3
```

---

## 🎯 Recommended Production Setup

### Small Team (< 100 audits/day)
**Use: Docker on AWS t3.micro EC2**
- Cost: ~$10/month
- Setup time: 30 minutes
- Maintenance: Minimal

### Medium Team (100-1000 audits/day)
**Use: Heroku + PostgreSQL add-on**
- Cost: ~$50/month
- Setup time: 5 minutes
- Maintenance: Automatic

### Enterprise (1000+ audits/day)
**Use: Kubernetes on AWS/GCP/Azure**
- Cost: $100+/month
- Setup time: 2-4 hours
- Maintenance: DevOps team

---

## ✅ Deployment Completed!

Your application is ready for production. Choose your deployment option above and follow the steps.

**Current Status:**
- ✅ Code committed to GitHub
- ✅ Docker image built and tested
- ✅ Environment configured
- ✅ Ready for deployment

**Next Steps:**
1. Choose deployment option (Docker/AWS/Heroku)
2. Follow the setup steps
3. Test the deployed application
4. Monitor logs for errors
5. Make UI improvements in V2

**Support:**
- Check logs: `docker-compose logs -f`
- View README.md for API documentation
- See CI-CD-SETUP.md for GitHub Actions

🚀 **Happy deploying!**
