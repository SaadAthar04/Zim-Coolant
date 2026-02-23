# Deployment Guide - Zim Coolant Website on AWS EC2

This guide explains how to deploy the Zim Coolant website on your existing AWS EC2 t3.micro instance alongside another website.

## Prerequisites

- AWS EC2 t3.micro instance (already running)
- nginx installed and configured for existing site
- Node.js 18+ installed
- PM2 (process manager) installed
- Your domain pointing to the EC2 instance

## Architecture Overview

```
EC2 Instance (t3.micro)
├── nginx (reverse proxy)
│   ├── zimchemicals.com → localhost:3001
│   └── othersite.com → localhost:3000
├── Zim Coolant (Next.js on port 3001)
│   └── SQLite database (embedded)
└── Other Site (on port 3000)
```

## Step-by-Step Deployment

### Step 1: Connect to your EC2 instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### Step 2: Create project directory

```bash
sudo mkdir -p /var/www/zimcoolant
sudo chown -R $USER:$USER /var/www/zimcoolant
cd /var/www/zimcoolant
```

### Step 3: Clone or upload your project

**Option A: Using Git**
```bash
git clone your-repo-url .
```

**Option B: Using SCP (from your local machine)**
```bash
# From your local machine
scp -i your-key.pem -r /Users/mac/Documents/Zim-Coolant/* ec2-user@your-ec2-ip:/var/www/zimcoolant/
```

### Step 4: Install dependencies and build

```bash
cd /var/www/zimcoolant
npm install
npm run build
```

### Step 5: Initialize the database

The SQLite database will be created automatically when the app starts. The database file is stored at:
```
/var/www/zimcoolant/database/zim-coolant.db
```

Make sure the directory has proper permissions:
```bash
chmod 755 /var/www/zimcoolant/database
```

### Step 6: Set up PM2 process

Create PM2 ecosystem file:
```bash
nano ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'zim-coolant',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/zimcoolant',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
}
```

Start the application:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions it gives
```

### Step 7: Configure nginx

Create nginx configuration:
```bash
sudo nano /etc/nginx/conf.d/zimcoolant.conf
```

Add this content:
```nginx
server {
    listen 80;
    server_name zimchemicals.com www.zimchemicals.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name zimchemicals.com www.zimchemicals.com;

    # SSL certificates (use certbot to generate)
    ssl_certificate /etc/letsencrypt/live/zimchemicals.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zimchemicals.com/privkey.pem;

    # SSL settings
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60;
        proxy_connect_timeout 60;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://127.0.0.1:3001;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Test and reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: Set up SSL with Let's Encrypt

```bash
sudo certbot --nginx -d zimchemicals.com -d www.zimchemicals.com
```

### Step 9: Configure firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## Managing Products

The SQLite database comes pre-seeded with 4 sample products. To manage products:

### Add Products via API

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Zim Coolant Green - 5L",
    "slug": "zim-coolant-green-5l",
    "description": "Premium engine coolant in 5L pack",
    "price": 2000,
    "category": "Coolant",
    "image_url": "https://your-image-url.com/coolant-5l.png",
    "stock_quantity": 50
  }'
```

### View Products

```bash
curl http://localhost:3001/api/products
```

### Update Product

```bash
curl -X PUT http://localhost:3001/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"price": 2500}'
```

## Database Backup

The SQLite database is a single file. Back it up regularly:

```bash
# Create backup
cp /var/www/zimcoolant/database/zim-coolant.db /backups/zim-coolant-$(date +%Y%m%d).db

# Set up daily cron backup
crontab -e
# Add: 0 2 * * * cp /var/www/zimcoolant/database/zim-coolant.db /backups/zim-coolant-$(date +\%Y\%m\%d).db
```

## Memory Considerations (t3.micro)

t3.micro has 1GB RAM. With two Next.js apps running:

1. **Monitor memory usage**:
   ```bash
   pm2 monit
   free -m
   ```

2. **Configure swap** (recommended):
   ```bash
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

3. **PM2 memory limits**: The ecosystem.config.js includes max_memory_restart: 500M to prevent memory issues.

## Troubleshooting

### Check application logs
```bash
pm2 logs zim-coolant
```

### Check nginx logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart application
```bash
pm2 restart zim-coolant
```

### Check port usage
```bash
sudo lsof -i :3001
```

### Database issues
```bash
# Check database file
ls -la /var/www/zimcoolant/database/

# If corrupted, restore from backup
cp /backups/zim-coolant-YYYYMMDD.db /var/www/zimcoolant/database/zim-coolant.db
pm2 restart zim-coolant
```

## Updating the Application

```bash
cd /var/www/zimcoolant
git pull  # or upload new files
npm install
npm run build
pm2 restart zim-coolant
```

## Environment Variables

Create .env file with:
```env
# Admin credentials
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password

# Port (for PM2)
PORT=3001
```

**Important**: Change the default admin password!
