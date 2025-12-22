# Ubuntu VPS Deployment Guide for ShareCells

This guide provides a complete setup for deploying ShareCells on an Ubuntu VPS with proper process management to prevent server crashes and 504 Gateway Timeout errors.

## Prerequisites

- Ubuntu 20.04+ VPS
- Node.js 18+ installed
- MySQL database
- Domain configured with DNS pointing to your VPS
- Nginx/OpenResty as reverse proxy

---

## 🔧 Step 1: System Preparation

### 1.1 Update System and Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git htop

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.2 Create Swap Memory (Prevents Out of Memory crashes)

```bash
# Check current swap
free -h

# Create 2GB swap file (adjust based on your VPS RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Configure swappiness (optional, reduces swap usage)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Verify swap
free -h
```

---

## 🚀 Step 2: Install PM2 Process Manager

PM2 is **essential** for production deployments. It will:
- Automatically restart your app if it crashes
- Monitor memory usage and restart if limits exceeded
- Provide logs and monitoring
- Start your app on server reboot

### 2.1 Install PM2 Globally

```bash
sudo npm install -g pm2
```

### 2.2 Create PM2 Ecosystem Configuration

Create this file in your project root:

```bash
nano /var/www/sharecells/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'sharecells',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/sharecells',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Memory management - restart if exceeds 500MB
      max_memory_restart: '500M',
      
      // Auto restart settings
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      
      // Logging
      log_file: '/var/www/sharecells/logs/combined.log',
      out_file: '/var/www/sharecells/logs/out.log',
      error_file: '/var/www/sharecells/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Log rotation (prevents disk space issues)
      max_size: '10M',
      retain: 5,
      
      // Kill timeout
      kill_timeout: 5000,
      
      // Listen timeout
      listen_timeout: 8000,
    }
  ]
};
```

### 2.3 Create Logs Directory

```bash
mkdir -p /var/www/sharecells/logs
```

---

## 📦 Step 3: Deploy Application

### 3.1 Clone and Setup

```bash
# Create directory
sudo mkdir -p /var/www/sharecells
sudo chown -R $USER:$USER /var/www/sharecells

# Clone your repository
cd /var/www
git clone https://github.com/spider10584329/sharecells.git sharecells
cd sharecells

# Install dependencies
npm install

# Create environment file
nano .env.local
```

### 3.2 Environment Variables (.env.local)

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/sharecells_prod"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secure-random-string-at-least-32-chars"

# Node environment
NODE_ENV=production

# Port
PORT=3000
```

### 3.3 Build Application

```bash
npm run build
```

---

## ▶️ Step 4: Start Application with PM2

### 4.1 Start the Application

```bash
cd /var/www/sharecells

# Start with ecosystem config
pm2 start ecosystem.config.js

# OR start directly (simpler)
pm2 start npm --name "sharecells" -- start

# Check status
pm2 status

# View logs
pm2 logs sharecells
```

### 4.2 Configure PM2 Startup (Auto-start on server reboot)

```bash
# Generate startup script
pm2 startup

# Follow the instructions it provides (copy/paste the command)
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Save current PM2 process list
pm2 save
```

### 4.3 Useful PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs sharecells
pm2 logs sharecells --lines 100

# Restart application
pm2 restart sharecells

# Stop application
pm2 stop sharecells

# Delete from PM2
pm2 delete sharecells

# Monitor (real-time dashboard)
pm2 monit

# Flush logs (clear log files)
pm2 flush

# Reload (zero-downtime reload)
pm2 reload sharecells
```

---

## 🌐 Step 5: Configure Nginx/OpenResty

### 5.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/sharecells
```

```nginx
server {
    listen 80;
    server_name app.sharecells.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.sharecells.com;

    # SSL Configuration (adjust paths for your SSL certificate)
    ssl_certificate /etc/letsencrypt/live/app.sharecells.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.sharecells.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Increase timeouts to prevent 504 errors
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    send_timeout 60s;

    # Increase buffer sizes
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint (optional)
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:3000/api/health;
    }
}
```

### 5.2 Enable Site and Test

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sharecells /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📊 Step 6: Setup Log Rotation

Prevent disk space from filling up with logs.

### 6.1 PM2 Log Rotation

```bash
# Install PM2 logrotate module
pm2 install pm2-logrotate

# Configure rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 5
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
```

### 6.2 System Log Rotation

```bash
sudo nano /etc/logrotate.d/sharecells
```

```
/var/www/sharecells/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 🔍 Step 7: Setup Monitoring and Health Checks

### 7.1 Create Health Check API (Optional)

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
```

### 7.2 Setup Cron Job for Health Monitoring

```bash
# Create monitoring script
nano /var/www/sharecells/monitor.sh
```

```bash
#!/bin/bash

# Health check script
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

if [ "$RESPONSE" != "200" ]; then
    echo "$(date): Health check failed with status $RESPONSE. Restarting..." >> /var/www/sharecells/logs/monitor.log
    pm2 restart sharecells
fi
```

```bash
# Make executable
chmod +x /var/www/sharecells/monitor.sh

# Add to crontab (runs every 5 minutes)
crontab -e
```

Add this line:
```
*/5 * * * * /var/www/sharecells/monitor.sh
```

---

## 🔄 Step 8: Weekly Scheduled Restart (Optional but Recommended)

To prevent any long-term memory buildup:

```bash
crontab -e
```

Add this line (restarts every Sunday at 4 AM):
```
0 4 * * 0 pm2 restart sharecells
```

---

## 🛠️ Step 9: Troubleshooting

### Check if Application is Running

```bash
pm2 status
pm2 logs sharecells --lines 50
```

### Check Server Resources

```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU and memory by process
htop

# Check Node.js processes
ps aux | grep node
```

### Check Nginx Errors

```bash
sudo tail -f /var/log/nginx/error.log
```

### Manual Application Restart

```bash
pm2 restart sharecells
```

### Complete Redeploy

```bash
cd /var/www/sharecells
git pull origin main
npm install
npm run build
pm2 restart sharecells
```

---

## 📋 Quick Reference Commands

```bash
# Start application
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs sharecells

# Restart
pm2 restart sharecells

# Stop
pm2 stop sharecells

# Monitor
pm2 monit

# Save PM2 list
pm2 save

# Check memory usage
free -h

# Check disk space
df -h
```

---

## ✅ Checklist for Stable Deployment

- [ ] Node.js 18+ installed
- [ ] Swap memory configured (2GB recommended)
- [ ] PM2 installed and configured
- [ ] ecosystem.config.js created
- [ ] PM2 startup configured (auto-start on reboot)
- [ ] Nginx configured with proper timeouts
- [ ] Log rotation configured
- [ ] Health check API created
- [ ] Monitoring cron job set up
- [ ] Weekly restart cron job (optional)
- [ ] Environment variables properly set

---

## 🎯 Summary

The main reasons for 504 Gateway Timeout after ~15 days are:

1. **Memory leaks** → Fixed with PM2's `max_memory_restart`
2. **No process manager** → Fixed with PM2
3. **Log file growth** → Fixed with log rotation
4. **No swap memory** → Fixed by creating swap file
5. **Nginx timeouts** → Fixed with proper timeout configuration

With this setup, your application will:
- Automatically restart if it crashes
- Restart if memory exceeds 500MB
- Start automatically on server reboot
- Have proper log management
- Be monitored every 5 minutes
