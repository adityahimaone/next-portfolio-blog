---
title: "Deploying Next.js to a VPS: Nginx, PM2, and Custom Domains"
slug: deploy-nextjs-vps-nginx-pm2-custom-domain
date: 2026-05-08
description: "A practical guide to deploying Next.js applications on a VPS with Nginx reverse proxy, PM2 process management, and custom domain setup."
tags: [nextjs, vps, deployment, nginx, pm2, devops]
published: true
---

Deploying a Next.js application to a VPS gives you control that managed platforms can't match. You decide the runtime, the caching strategy, the security posture, and the cost. The trade-off is you also decide the failure modes. I've run production Next.js apps on a $5/month VPS for years, and the setup is simpler than most tutorials make it seem.

## Why a VPS over Vercel or Netlify

Managed platforms abstract away the infrastructure, which is great until you need something they don't support. Custom middleware, specific Node.js flags, persistent background jobs, or just wanting to avoid vendor lock-in are all valid reasons to run your own server. A VPS also costs less at scale. A $5/month VPS can handle tens of thousands of monthly visitors for a typical Next.js app, while equivalent traffic on Vercel's Pro plan runs $20 or more.

The downside is you become the operations team. You monitor the server, apply security patches, and debug outages. If that sounds like work you're willing to do, the rest of this guide will get you there.

## Environment setup

Start with a fresh Ubuntu 22.04 VPS. I use the smallest instance from most providers—1GB RAM, 1 vCPU, 25GB SSD. That's enough for a Next.js app and a few side services.

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

Verify Node.js is installed correctly:

```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

## Application setup

Clone your Next.js repository. I keep mine in `/var/www/` but any directory works as long as the user running PM2 has read access.

```bash
cd /var/www
sudo git clone https://github.com/yourusername/your-nextjs-app.git
cd your-nextjs-app
```

Install dependencies and build. Use `npm ci` for reproducible builds instead of `npm install`.

```bash
npm ci
npm run build
```

The build step is critical. Next.js 15+ with Turbopack can have memory issues on small VPS instances. If the build fails with out-of-memory errors, add a swap file:

```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## PM2 process management

PM2 keeps your application running, restarts it on crashes, and manages logs. Create a simple ecosystem file:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nextjs-app',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/your-nextjs-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start the application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

The last command generates a systemd service that starts PM2 on boot. Follow the output to enable it.

Check that your app is running:

```bash
pm2 status
curl http://localhost:3000
```

## Nginx reverse proxy

Nginx sits in front of your Next.js app, handling SSL termination, static file serving, and load balancing if you scale to multiple instances.

Create a new Nginx config:

```bash
sudo nano /etc/nginx/sites-available/nextjs-app
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static file caching
    location /_next/static {
        alias /var/www/your-nextjs-app/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Enable the site and test the config:

```bash
sudo ln -s /etc/nginx/sites-available/nextjs-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Custom domain and SSL

Point your domain's A record to your VPS IP. I use Cloudflare because their DNS is fast and free. Once DNS propagates, install Certbot for Let's Encrypt SSL certificates:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will modify your Nginx config automatically and set up automatic renewal. Test the renewal with:

```bash
sudo certbot renew --dry-run
```

## Common pitfalls

**Port conflicts:** Make sure nothing else is using port 3000. Use `sudo lsof -i :3000` to check.

**File permissions:** The user running PM2 needs read access to your app directory. I create a dedicated system user for each app:

```bash
sudo useradd -r -s /bin/false nextjs-user
sudo chown -R nextjs-user:nextjs-user /var/www/your-nextjs-app
```

Then update the PM2 ecosystem file to run as that user.

**Memory limits:** Next.js builds can be memory-hungry. If your build fails, check `dmesg` for OOM killer logs. The swap file helps, but consider upgrading to a VPS with more RAM if builds consistently fail.

**Nginx caching:** The static file caching in the Nginx config is aggressive. If you change your CSS or JavaScript and don't see updates, clear the browser cache or add a version query string to your assets.

**PM2 logs:** Check application logs with `pm2 logs nextjs-app`. Errors often appear there before they reach the browser.

## Monitoring

Basic monitoring is essential. I install `htop` for real-time resource viewing and set up a simple uptime check with `cron`:

```bash
# Install htop
sudo apt install -y htop

# Add a cron job to check if the app is responding
crontab -e
# Add: */5 * * * * curl -f http://localhost:3000/health >/dev/null 2>&1 || systemctl restart nginx
```

For more serious monitoring, I run a Prometheus + Grafana stack on the same VPS, but that's a topic for another post.

## The control trade-off

Running your own VPS means you control everything, from the Node.js version to the SSL cipher suites. That control comes with responsibility—you're on call when things break. But for many developers, that's a fair trade. You learn how the stack actually works, you can optimize for your specific use case, and you're not at the mercy of a platform's pricing changes or feature deprecations.

My $5/month VPS has hosted portfolio sites, small SaaS applications, and internal tools for years. It rarely goes down, and when it does, I know exactly how to fix it because I built the system. That knowledge is worth more than the time saved by using a managed platform.

Start with a non-critical project. Deploy a personal blog or a side project. Get comfortable with the commands, the failure modes, and the recovery procedures. Once you've survived your first midnight outage fix, you'll know whether the VPS path is right for you.
