# Deployment and Environment Setup Guide
## Banrimkwae Resort Management System - Phase 1

### Table of Contents
1. [Environment Overview](#environment-overview)
2. [Local Development Setup](#local-development-setup)
3. [Staging Environment](#staging-environment)
4. [Production Environment](#production-environment)
5. [Docker Configuration](#docker-configuration)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Database Management](#database-management)
8. [Security Configuration](#security-configuration)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Backup and Recovery](#backup-and-recovery)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

---

## Environment Overview

### 🌐 Environment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ • Local Setup   │────▶│ • AWS/Docker   │────▶│ • AWS/Docker   │
│ • Hot Reload    │    │ • CI/CD Tests   │    │ • Load Balancer │
│ • Debug Mode    │    │ • UAT Testing   │    │ • Auto Scaling  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📋 Environment Specifications

| Environment | Purpose | Infrastructure | Database | Domain |
|------------|---------|---------------|----------|---------|
| **Development** | Local development | Docker/Local | MySQL Local | localhost:3000 |
| **Staging** | Testing & UAT | AWS EC2/ECS | RDS MySQL | staging.banrimkwae.com |
| **Production** | Live system | AWS EC2/ECS | RDS MySQL (Multi-AZ) | app.banrimkwae.com |

---

## Local Development Setup

### 🔧 Prerequisites Installation

#### System Requirements
```bash
# Required Software
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PHP 8.2+
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-gd php8.2-mbstring php8.2-zip

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 🚀 Quick Start Guide

#### 1. Repository Setup
```bash
# Clone repository
git clone https://github.com/your-org/banrimkwae.git
cd banrimkwae

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp docker/.env.example docker/.env

# Make scripts executable
chmod +x scripts/*.sh
```

#### 2. Docker Development Setup
```bash
# Start development environment
docker-compose -f docker/docker-compose.dev.yml up -d

# Install dependencies
docker-compose exec backend composer install
docker-compose exec frontend npm install

# Run initial setup
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan db:seed
```

#### 3. Manual Setup (Alternative)
```bash
# Backend setup
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --host=0.0.0.0 --port=8000

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

### 📝 Environment Configuration Files

#### Backend Environment (.env)
```env
# Application
APP_NAME="Banrimkwae Resort"
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=banrimkwae_dev
DB_USERNAME=root
DB_PASSWORD=secret

# JWT Authentication
JWT_SECRET=your-jwt-secret
JWT_TTL=60
JWT_REFRESH_TTL=20160

# Redis (Optional)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@banrimkwae.com
MAIL_FROM_NAME="${APP_NAME}"

# File Storage
FILESYSTEM_DISK=local
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
```

#### Frontend Environment (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_VERSION=v1

# Application
REACT_APP_NAME="Banrimkwae Resort Management"
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Features
REACT_APP_ENABLE_DEV_TOOLS=true
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_SENTRY=false

# Authentication
REACT_APP_JWT_STORAGE_KEY=banrimkwae_token
REACT_APP_REFRESH_TOKEN_KEY=banrimkwae_refresh_token

# UI Configuration
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_SUPPORTED_LANGUAGES=en,th
REACT_APP_THEME=light
```

---

## Staging Environment

### 🏗️ AWS Infrastructure Setup

#### VPC Configuration
```yaml
# cloudformation/vpc.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'VPC for Banrimkwae Resort Management System'

Parameters:
  EnvironmentName:
    Description: Environment name prefix
    Type: String
    Default: staging

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-VPC

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Public-Subnet-1

  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.2.0/24
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-Subnet-1
```

#### ECS Cluster Setup
```yaml
# cloudformation/ecs-cluster.yml
Resources:
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub ${EnvironmentName}-cluster
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT
      DefaultCapacityProviderStrategy:
        - CapacityProvider: FARGATE
          Weight: 1

  ECSTaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: !Sub ${EnvironmentName}-task
      Cpu: 512
      Memory: 1024
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      ExecutionRoleArn: !Ref ECSExecutionRole
      ContainerDefinitions:
        - Name: backend
          Image: !Sub ${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/banrimkwae-backend:latest
          PortMappings:
            - ContainerPort: 8000
          Environment:
            - Name: APP_ENV
              Value: staging
            - Name: DB_HOST
              Value: !GetAtt RDSInstance.Endpoint.Address
```

#### RDS Database Setup
```yaml
# cloudformation/rds.yml
Resources:
  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnet group for RDS database
      SubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-db-subnet-group

  RDSInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub ${EnvironmentName}-mysql
      DBInstanceClass: db.t3.micro
      Engine: mysql
      EngineVersion: 8.0.35
      AllocatedStorage: 20
      StorageType: gp2
      DBName: banrimkwae
      MasterUsername: admin
      MasterUserPassword: !Ref DBPassword
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
      BackupRetentionPeriod: 7
      MultiAZ: false
      PubliclyAccessible: false
```

### 🚀 Staging Deployment Script

```bash
#!/bin/bash
# scripts/deploy-staging.sh

set -e

echo "🚀 Starting staging deployment..."

# Configuration
REGION="us-west-2"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
CLUSTER_NAME="staging-cluster"
SERVICE_NAME="staging-service"

# Build and push backend image
echo "📦 Building backend image..."
cd backend
docker build -t banrimkwae-backend:latest .
docker tag banrimkwae-backend:latest ${ECR_REGISTRY}/banrimkwae-backend:latest
docker push ${ECR_REGISTRY}/banrimkwae-backend:latest

# Build and push frontend image
echo "📦 Building frontend image..."
cd ../frontend
npm run build
docker build -t banrimkwae-frontend:latest .
docker tag banrimkwae-frontend:latest ${ECR_REGISTRY}/banrimkwae-frontend:latest
docker push ${ECR_REGISTRY}/banrimkwae-frontend:latest

# Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --force-new-deployment \
  --region ${REGION}

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --region ${REGION}

# Run database migrations
echo "🗄️  Running database migrations..."
aws ecs run-task \
  --cluster ${CLUSTER_NAME} \
  --task-definition staging-migration-task \
  --region ${REGION}

echo "✅ Staging deployment completed successfully!"
```

---

## Production Environment

### 🏭 Production Infrastructure

#### High Availability Setup
```yaml
# cloudformation/production.yml
Resources:
  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub ${EnvironmentName}-alb
      Type: application
      Scheme: internet-facing
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  # Auto Scaling Group
  AutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      LaunchTemplate:
        LaunchTemplateId: !Ref LaunchTemplate
        Version: !GetAtt LaunchTemplate.LatestVersionNumber
      MinSize: 2
      MaxSize: 10
      DesiredCapacity: 2
      VPCZoneIdentifier:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2
      TargetGroupARNs:
        - !Ref TargetGroup

  # RDS Multi-AZ
  ProductionRDS:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.t3.medium
      MultiAZ: true
      BackupRetentionPeriod: 30
      DeleteAutomatedBackups: false
      DeletionProtection: true
```

#### SSL Certificate Setup
```bash
# Request SSL certificate
aws acm request-certificate \
  --domain-name app.banrimkwae.com \
  --domain-name *.banrimkwae.com \
  --validation-method DNS \
  --region us-west-2

# Verify domain ownership (manual step)
# Update Route53 with validation records
```

### 🔐 Production Deployment Script

```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "🚀 Starting production deployment..."

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
./scripts/pre-deploy-checks.sh

# Backup current database
echo "💾 Creating database backup..."
aws rds create-db-snapshot \
  --db-instance-identifier production-mysql \
  --db-snapshot-identifier "pre-deploy-$(date +%Y%m%d%H%M%S)" \
  --region us-west-2

# Blue-Green Deployment
echo "🔄 Starting blue-green deployment..."

# Update task definition with new image
NEW_TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition production-task \
  --query 'taskDefinition' \
  --output json | \
  jq '.containerDefinitions[0].image = "'${ECR_REGISTRY}'/banrimkwae-backend:latest"' | \
  jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)')

# Register new task definition
NEW_TASK_ARN=$(echo $NEW_TASK_DEF | aws ecs register-task-definition \
  --cli-input-json file:///dev/stdin \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

# Update service with new task definition
aws ecs update-service \
  --cluster production-cluster \
  --service production-service \
  --task-definition $NEW_TASK_ARN

# Wait for deployment to stabilize
aws ecs wait services-stable \
  --cluster production-cluster \
  --services production-service

# Run smoke tests
echo "🧪 Running smoke tests..."
./scripts/smoke-tests.sh https://app.banrimkwae.com

echo "✅ Production deployment completed successfully!"
```

---

## Docker Configuration

### 🐳 Multi-Stage Dockerfiles

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM php:8.2-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    mysql-client

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Development stage
FROM base AS development
WORKDIR /var/www/html
RUN pecl install xdebug && docker-php-ext-enable xdebug
COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini
COPY . .
RUN composer install --no-cache --prefer-dist --optimize-autoloader
CMD php artisan serve --host=0.0.0.0 --port=8000

# Production stage
FROM base AS production
WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev --no-cache --prefer-dist --optimize-autoloader --no-scripts
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
EXPOSE 8000
CMD php artisan octane:start --server=roadrunner --host=0.0.0.0 --port=8000
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS base

# Development stage
FROM base AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Build stage
FROM base AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 📋 Docker Compose Files

#### Development Compose
```yaml
# docker/docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: ../backend
      target: development
    ports:
      - "8000:8000"
    volumes:
      - ../backend:/var/www/html
      - backend_vendor:/var/www/html/vendor
    environment:
      - APP_ENV=local
      - DB_HOST=mysql
    depends_on:
      - mysql
      - redis

  frontend:
    build:
      context: ../frontend
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ../frontend:/app
      - frontend_node_modules:/app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: banrimkwae_dev
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
  backend_vendor:
  frontend_node_modules:
```

#### Production Compose
```yaml
# docker/docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ../backend
      target: production
    environment:
      - APP_ENV=production
      - DB_HOST=${DB_HOST}
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - redis

  frontend:
    build:
      context: ../frontend
      target: production
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
```

---

## CI/CD Pipeline

### 🔄 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main, staging]

env:
  AWS_REGION: us-west-2
  ECR_REPOSITORY_BACKEND: banrimkwae-backend
  ECR_REPOSITORY_FRONTEND: banrimkwae-frontend

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install Backend Dependencies
        run: |
          cd backend
          composer install --prefer-dist --no-progress
          
      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Run Backend Tests
        run: |
          cd backend
          php artisan test --coverage
          
      - name: Run Frontend Tests
        run: |
          cd frontend
          npm test -- --coverage --watchAll=false
          
      - name: Run Security Scan
        run: |
          cd backend
          composer audit
          cd ../frontend
          npm audit --audit-level high

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
        
      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:latest
          
      - name: Build and push frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd frontend
          npm run build
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:latest
          
      - name: Deploy to staging
        if: github.ref == 'refs/heads/staging'
        run: |
          aws ecs update-service --cluster staging-cluster --service staging-service --force-new-deployment
          
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          aws ecs update-service --cluster production-cluster --service production-service --force-new-deployment
          
      - name: Run smoke tests
        run: |
          if [ "${{ github.ref }}" = "refs/heads/staging" ]; then
            ./scripts/smoke-tests.sh https://staging.banrimkwae.com
          else
            ./scripts/smoke-tests.sh https://app.banrimkwae.com
          fi
```

---

## Database Management

### 🗄️ Migration Strategy

#### Production Migration Script
```bash
#!/bin/bash
# scripts/migrate-production.sh

set -e

echo "🗄️  Starting production database migration..."

# Create backup before migration
BACKUP_NAME="pre-migration-$(date +%Y%m%d%H%M%S)"
aws rds create-db-snapshot \
  --db-instance-identifier production-mysql \
  --db-snapshot-identifier $BACKUP_NAME \
  --region us-west-2

echo "✅ Backup created: $BACKUP_NAME"

# Wait for backup to complete
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier $BACKUP_NAME \
  --region us-west-2

# Run migrations in maintenance mode
echo "🔧 Enabling maintenance mode..."
aws ecs run-task \
  --cluster production-cluster \
  --task-definition production-maintenance-task \
  --overrides '{
    "containerOverrides": [{
      "name": "backend",
      "command": ["php", "artisan", "down", "--retry=60"]
    }]
  }' \
  --region us-west-2

# Run actual migrations
echo "⚡ Running database migrations..."
aws ecs run-task \
  --cluster production-cluster \
  --task-definition production-migration-task \
  --overrides '{
    "containerOverrides": [{
      "name": "backend",
      "command": ["php", "artisan", "migrate", "--force"]
    }]
  }' \
  --region us-west-2

# Disable maintenance mode
echo "🟢 Disabling maintenance mode..."
aws ecs run-task \
  --cluster production-cluster \
  --task-definition production-maintenance-task \
  --overrides '{
    "containerOverrides": [{
      "name": "backend",
      "command": ["php", "artisan", "up"]
    }]
  }' \
  --region us-west-2

echo "✅ Production migration completed successfully!"
```

#### Database Backup Strategy
```bash
#!/bin/bash
# scripts/backup-database.sh

# Daily automated backups
aws rds create-db-snapshot \
  --db-instance-identifier production-mysql \
  --db-snapshot-identifier "daily-backup-$(date +%Y%m%d)" \
  --region us-west-2

# Weekly full backup to S3
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME | \
  gzip | \
  aws s3 cp - s3://banrimkwae-backups/weekly/database-$(date +%Y%m%d).sql.gz

# Cleanup old snapshots (retain 30 days)
aws rds describe-db-snapshots \
  --db-instance-identifier production-mysql \
  --query 'DBSnapshots[?SnapshotCreateTime<=`'$(date -d '30 days ago' --iso-8601)'`].DBSnapshotIdentifier' \
  --output text | \
  xargs -n1 aws rds delete-db-snapshot --db-snapshot-identifier
```

---

## Security Configuration

### 🔐 Security Best Practices

#### SSL/TLS Configuration
```nginx
# docker/nginx/ssl.conf
server {
    listen 443 ssl http2;
    server_name app.banrimkwae.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.banrimkwae.com;
    return 301 https://$server_name$request_uri;
}
```

#### AWS Security Groups
```yaml
# Security Group for ALB
ALBSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for Application Load Balancer
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 80
        ToPort: 80
        CidrIp: 0.0.0.0/0
      - IpProtocol: tcp
        FromPort: 443
        ToPort: 443
        CidrIp: 0.0.0.0/0

# Security Group for ECS Tasks
ECSSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for ECS tasks
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 8000
        ToPort: 8000
        SourceSecurityGroupId: !Ref ALBSecurityGroup

# Security Group for RDS
DatabaseSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for RDS database
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 3306
        ToPort: 3306
        SourceSecurityGroupId: !Ref ECSSecurityGroup
```

#### Environment Secrets Management
```bash
# Store secrets in AWS Systems Manager Parameter Store
aws ssm put-parameter \
  --name "/banrimkwae/production/jwt-secret" \
  --value "your-super-secret-jwt-key" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/banrimkwae/production/db-password" \
  --value "your-database-password" \
  --type "SecureString"

# Retrieve secrets in ECS task definition
{
  "name": "JWT_SECRET",
  "valueFrom": "/banrimkwae/production/jwt-secret"
}
```

---

## Monitoring and Logging

### 📊 Application Monitoring

#### CloudWatch Configuration
```yaml
# cloudformation/monitoring.yml
Resources:
  ApplicationDashboard:
    Type: AWS::CloudWatch::Dashboard
    Properties:
      DashboardName: !Sub ${EnvironmentName}-dashboard
      DashboardBody: !Sub |
        {
          "widgets": [
            {
              "type": "metric",
              "properties": {
                "metrics": [
                  ["AWS/ECS", "CPUUtilization", "ServiceName", "${EnvironmentName}-service"],
                  [".", "MemoryUtilization", ".", "."]
                ],
                "period": 300,
                "stat": "Average",
                "region": "${AWS::Region}",
                "title": "ECS Resource Utilization"
              }
            },
            {
              "type": "metric",
              "properties": {
                "metrics": [
                  ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "${ApplicationLoadBalancer}"],
                  [".", "ResponseTime", ".", "."],
                  [".", "HTTPCode_ELB_5XX_Count", ".", "."]
                ],
                "period": 300,
                "stat": "Sum",
                "region": "${AWS::Region}",
                "title": "Application Load Balancer Metrics"
              }
            }
          ]
        }

  HighCPUAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub ${EnvironmentName}-high-cpu
      AlarmDescription: High CPU utilization
      MetricName: CPUUtilization
      Namespace: AWS/ECS
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 80
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopic
```

#### Application Logging Setup
```php
<?php
// backend/config/logging.php

return [
    'default' => env('LOG_CHANNEL', 'stack'),
    
    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['cloudwatch', 'daily'],
            'ignore_exceptions' => false,
        ],
        
        'cloudwatch' => [
            'driver' => 'custom',
            'via' => App\Logging\CloudWatchLoggerFactory::class,
            'level' => 'info',
            'retention' => 30,
        ],
        
        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => 'debug',
            'days' => 14,
        ],
    ],
];
```

### 🔍 Error Tracking

#### Sentry Integration
```javascript
// frontend/src/utils/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENVIRONMENT,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});

export default Sentry;
```

```php
<?php
// backend/app/Exceptions/Handler.php

use Sentry\Laravel\Integration;

class Handler extends ExceptionHandler
{
    public function report(Throwable $exception)
    {
        if (app()->bound('sentry') && $this->shouldReport($exception)) {
            app('sentry')->captureException($exception);
        }

        parent::report($exception);
    }
}
```

---

## Backup and Recovery

### 💾 Backup Strategy

#### Automated Backup Script
```bash
#!/bin/bash
# scripts/automated-backup.sh

# Configuration
BACKUP_BUCKET="banrimkwae-backups"
DB_HOST=${DB_HOST}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Create timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Database backup
echo "📦 Creating database backup..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > "db_backup_${TIMESTAMP}.sql.gz"

# Upload to S3
aws s3 cp "db_backup_${TIMESTAMP}.sql.gz" "s3://${BACKUP_BUCKET}/database/"

# File storage backup
echo "📁 Backing up file storage..."
aws s3 sync storage/app/public/ "s3://${BACKUP_BUCKET}/files/${TIMESTAMP}/"

# Environment configuration backup
echo "⚙️  Backing up configuration..."
tar -czf "config_backup_${TIMESTAMP}.tar.gz" .env docker/
aws s3 cp "config_backup_${TIMESTAMP}.tar.gz" "s3://${BACKUP_BUCKET}/config/"

# Cleanup local files
rm -f "db_backup_${TIMESTAMP}.sql.gz" "config_backup_${TIMESTAMP}.tar.gz"

echo "✅ Backup completed successfully!"
```

#### Disaster Recovery Plan
```bash
#!/bin/bash
# scripts/disaster-recovery.sh

echo "🚨 Starting disaster recovery procedure..."

# Step 1: Provision new infrastructure
echo "🏗️  Provisioning new infrastructure..."
aws cloudformation create-stack \
  --stack-name banrimkwae-recovery \
  --template-body file://cloudformation/recovery.yml \
  --capabilities CAPABILITY_IAM

# Step 2: Restore database
echo "🗄️  Restoring database..."
# Get latest backup
LATEST_BACKUP=$(aws s3 ls s3://banrimkwae-backups/database/ --recursive | sort | tail -n 1 | awk '{print $4}')
aws s3 cp "s3://banrimkwae-backups/${LATEST_BACKUP}" ./
gunzip $(basename $LATEST_BACKUP)
mysql -h $NEW_DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < $(basename $LATEST_BACKUP .gz)

# Step 3: Restore file storage
echo "📁 Restoring file storage..."
aws s3 sync s3://banrimkwae-backups/files/latest/ storage/app/public/

# Step 4: Update DNS
echo "🌐 Updating DNS records..."
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://dns-recovery.json

echo "✅ Disaster recovery completed!"
```

---

## Performance Optimization

### ⚡ Application Performance

#### Laravel Optimization
```php
<?php
// backend/config/cache.php

return [
    'default' => env('CACHE_DRIVER', 'redis'),
    
    'stores' => [
        'redis' => [
            'driver' => 'redis',
            'connection' => 'cache',
            'options' => [
                'cluster' => env('REDIS_CLUSTER', 'redis'),
                'prefix' => env('CACHE_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_cache'),
            ],
        ],
    ],
];

// Performance optimization commands
// php artisan config:cache
// php artisan route:cache
// php artisan view:cache
// php artisan queue:work --daemon
```

#### React Performance
```javascript
// frontend/src/utils/performance.js
import { memo, useMemo, useCallback } from 'react';

// Component memoization
export const MemoizedComponent = memo(({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);

  const handleAction = useCallback((id) => {
    onAction(id);
  }, [onAction]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleAction(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});

// Lazy loading
export const LazyComponent = lazy(() => import('./ExpensiveComponent'));
```

#### Database Optimization
```sql
-- Create indexes for frequent queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_audit_logs_user_id_created_at ON audit_logs(user_id, created_at);

-- Query optimization
EXPLAIN SELECT u.*, r.name as role_name 
FROM users u 
LEFT JOIN roles r ON u.role_id = r.id 
WHERE u.status = 'active' 
ORDER BY u.created_at DESC 
LIMIT 20;
```

---

## Troubleshooting

### 🔧 Common Issues and Solutions

#### Issue: ECS Service Won't Start
**Symptoms**: ECS tasks keep stopping with exit code 1
**Diagnosis**:
```bash
# Check task logs
aws logs get-log-events \
  --log-group-name /ecs/production-task \
  --log-stream-name ecs/backend/$(aws ecs list-tasks --cluster production-cluster --query 'taskArns[0]' --output text | cut -d'/' -f3)

# Check task definition
aws ecs describe-task-definition --task-definition production-task
```
**Solutions**:
- Verify environment variables are set correctly
- Check database connectivity
- Ensure proper IAM permissions

#### Issue: High Database CPU
**Symptoms**: Application slow, database CPU >80%
**Diagnosis**:
```sql
-- Check slow queries
SELECT * FROM information_schema.processlist WHERE Time > 10;

-- Check query performance
SHOW PROCESSLIST;
EXPLAIN your_slow_query;
```
**Solutions**:
- Add missing indexes
- Optimize slow queries
- Scale database instance
- Implement query caching

#### Issue: Frontend Build Failures
**Symptoms**: Docker build fails during npm install
**Diagnosis**:
```bash
# Check for dependency conflicts
npm ls
npm audit

# Check for memory issues
docker build --memory=4g .
```
**Solutions**:
- Clear npm cache: `npm cache clean --force`
- Update package-lock.json
- Increase Docker memory allocation
- Use multi-stage builds to reduce size

### 📚 Troubleshooting Checklist

#### Pre-Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates valid
- [ ] DNS records updated
- [ ] Security groups configured
- [ ] Load balancer health checks passing
- [ ] Backup strategy verified
- [ ] Monitoring alerts configured

#### Post-Deployment Verification
- [ ] Application responds to health checks
- [ ] Database connections working
- [ ] Authentication flow functional
- [ ] File uploads working
- [ ] Email notifications sending
- [ ] Logs being captured
- [ ] Metrics being collected
- [ ] SSL certificate valid

#### Emergency Procedures
1. **Rollback Plan**: Keep previous task definition for quick rollback
2. **Emergency Contacts**: Maintain on-call rotation
3. **Communication Plan**: Slack/Discord channels for incidents
4. **Escalation Path**: Technical lead → DevOps → Management

---

## Conclusion

This deployment guide provides comprehensive instructions for setting up and managing the Banrimkwae Resort Management System across all environments. The infrastructure is designed for scalability, security, and reliability, with proper monitoring and backup procedures in place.

### Key Success Factors:
- **Infrastructure as Code**: All resources defined in CloudFormation
- **Automated Deployments**: CI/CD pipeline reduces manual errors
- **Comprehensive Monitoring**: Full visibility into application performance
- **Security First**: SSL, encryption, and proper access controls
- **Disaster Recovery**: Automated backups and recovery procedures

### Next Steps:
1. Review and customize configuration files for your environment
2. Set up AWS account and configure permissions
3. Deploy staging environment for testing
4. Run full deployment tests
5. Deploy to production with proper monitoring

---

*Last Updated: December 2024*
*Version: 1.0.0*
