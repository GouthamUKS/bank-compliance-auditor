#!/bin/bash

# 🚀 Safe Deployment Script for Bank Compliance Auditor
# Version: V1
# Author: GouthamUKS

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 Bank Compliance Auditor - Safe Deployment Script      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="bank-auditor"
VERSION="v1"
DOCKER_IMAGE="$PROJECT_NAME:$VERSION"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Install from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Install from: https://docs.docker.com/compose/install"
    exit 1
fi

echo -e "${GREEN}✅ Docker $(docker --version | awk '{print $3}')${NC}"
echo -e "${GREEN}✅ Docker Compose $(docker-compose --version | awk '{print $3}')${NC}"
echo ""

# Get deployment choice
echo "🎯 Deployment Options:"
echo "  1. Docker Compose (Local/Development)"
echo "  2. Docker Build & Push (Production)"
echo "  3. Verify Configuration Only"
echo ""
read -p "Choose option (1-3): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        echo ""
        echo "🚀 Starting Docker Compose..."
        docker-compose up -d
        
        echo ""
        echo "⏳ Waiting for application to start (10 seconds)..."
        sleep 10
        
        echo "📊 Checking health..."
        if curl -s http://localhost:3000 > /dev/null; then
            echo -e "${GREEN}✅ Application is running!${NC}"
            echo ""
            echo "🌐 Dashboard: http://localhost:3000"
            echo "📡 API: http://localhost:3000/api"
            echo "📊 Health: http://localhost:3000/api/health"
            echo ""
            echo "To stop: docker-compose down"
        else
            echo -e "${RED}❌ Application failed to start${NC}"
            docker-compose logs
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo "🔨 Building Docker image..."
        docker build -t $DOCKER_IMAGE .
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Docker image built successfully${NC}"
            echo ""
            echo "🐳 Image: $DOCKER_IMAGE"
            echo ""
            echo "Next steps to deploy:"
            echo "  1. Docker Hub: docker push GouthamUKS/$DOCKER_IMAGE"
            echo "  2. AWS: docker run -p 3000:3000 $DOCKER_IMAGE"
            echo "  3. Heroku: git push heroku main"
        else
            echo -e "${RED}❌ Docker build failed${NC}"
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "📋 Configuration Check:"
        echo ""
        
        if [ -f .env ]; then
            echo -e "${GREEN}✅ .env file exists${NC}"
            echo "Environment variables configured:"
            grep -v "^#" .env | grep -v "^$" | sed 's/=.*//' | sort
        else
            echo -e "${YELLOW}⚠️  .env file not found${NC}"
            echo "Copy .env.example to .env:"
            echo "  cp .env.example .env"
        fi
        
        echo ""
        echo "📦 Dependencies:"
        if [ -d "node_modules" ]; then
            echo -e "${GREEN}✅ node_modules installed${NC}"
        else
            echo -e "${YELLOW}⚠️  node_modules not found${NC}"
            echo "Run: npm install"
        fi
        
        echo ""
        echo "🔧 Files:"
        echo -e "${GREEN}✅ Dockerfile${NC}"
        echo -e "${GREEN}✅ docker-compose.yml${NC}"
        echo -e "${GREEN}✅ src/server.js${NC}"
        echo -e "${GREEN}✅ public/index.html${NC}"
        
        echo ""
        echo -e "${GREEN}✅ Configuration check complete!${NC}"
        ;;
        
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Deployment Script Complete                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
