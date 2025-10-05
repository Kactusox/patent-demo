# Patent Management System - Deployment Guide 🚀

This guide covers different deployment options for the Patent Management System.

## Table of Contents
- [Development Deployment](#development-deployment)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## Development Deployment

### Quick Start
The easiest way to start the development environment:

```bash
./start-dev.sh
```

This script will:
- ✅ Check for Node.js and npm
- 📦 Install all dependencies
- 🔧 Start backend server (port 5001)
- 🌐 Start frontend server (port 5173)
- 📊 Display access URLs and credentials

### Manual Development Setup

1. **Install Dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend && npm install
```

2. **Configure Environment**
```bash
# Create backend/.env file
cd backend
cp .env.example .env
# Edit .env with your settings
```

3. **Start Services**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

---

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Development with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production with Docker

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start production services
docker-compose -f docker-compose.yml up -d

# Scale services (if needed)
docker-compose -f docker-compose.yml up -d --scale backend=2
```

### Docker Services
- **frontend**: Nginx serving React app (port 80)
- **backend**: Node.js API server (port 5001)

---

## Production Deployment

### Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Docker-compatible OS
- **RAM**: Minimum 2GB, Recommended 4GB
- **Storage**: Minimum 10GB for application + uploaded files
- **CPU**: 2+ cores recommended

### Option 1: Traditional Deployment

1. **Install Node.js**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

2. **Install PM2 (Process Manager)**
```bash
npm install -g pm2
```

3. **Deploy Application**
```bash
# Clone repository
git clone <repository-url> /opt/patent-system
cd /opt/patent-system

# Install dependencies
npm install
cd backend && npm install && cd ..

# Build frontend
npm run build

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env for production

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

4. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /opt/patent-system/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Uploads proxy
    location /uploads/ {
        proxy_pass http://localhost:5001;
    }
}
```

### Option 2: Docker Production Deployment

1. **Prepare Server**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Deploy Application**
```bash
# Clone and deploy
git clone <repository-url> /opt/patent-system
cd /opt/patent-system

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env for production

# Start services
docker-compose up -d --build

# Enable auto-restart
docker update --restart=unless-stopped $(docker ps -q)
```

3. **SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## Environment Configuration

### Backend Environment Variables

```env
# Server Configuration
PORT=5001
NODE_ENV=production
HOST=0.0.0.0

# Database
DB_NAME=patent_system.db

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf

# Security
SESSION_SECRET=your-super-secret-key-change-this

# CORS
ALLOWED_ORIGINS=https://your-domain.com

# Logging
LOG_LEVEL=info
```

### Production Checklist

- [ ] Change default passwords
- [ ] Set strong SESSION_SECRET
- [ ] Configure proper ALLOWED_ORIGINS
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring
- [ ] Configure backup for database and uploads
- [ ] Set up log rotation

---

## Monitoring and Maintenance

### Health Checks
```bash
# Check API health
curl http://localhost:5001/api/health

# Check database
curl http://localhost:5001/api/patents/stats/summary

# Docker health
docker-compose ps
```

### Log Management
```bash
# PM2 logs
pm2 logs

# Docker logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy
```bash
# Database backup
cp /opt/patent-system/backend/patent_system.db /backup/patent_system_$(date +%Y%m%d).db

# Uploads backup
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /opt/patent-system/backend/uploads/

# Automated backup script
cat > /opt/backup-patent-system.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/patent-system"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
cp /opt/patent-system/backend/patent_system.db $BACKUP_DIR/patent_system_$DATE.db

# Uploads backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/patent-system/backend/uploads/

# Keep only last 7 days
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/backup-patent-system.sh

# Add to crontab (daily backup at 2 AM)
echo "0 2 * * * /opt/backup-patent-system.sh >> /var/log/patent-backup.log 2>&1" | sudo crontab -
```

---

## Performance Optimization

### Frontend Optimization
- Static assets are cached for 1 year
- Gzip compression enabled
- Bundle size optimization with Vite

### Backend Optimization
- SQLite performance tuning
- File upload streaming
- Response compression

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_patents_status ON patents(status);
CREATE INDEX idx_patents_institution ON patents(institution);
CREATE INDEX idx_patents_year ON patents(year);
CREATE INDEX idx_patents_created_at ON patents(created_at);
```

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process using port
sudo lsof -ti:5001 | xargs sudo kill -9
```

**File Upload Issues**
```bash
# Check uploads directory permissions
sudo chown -R www-data:www-data /opt/patent-system/backend/uploads/
sudo chmod -R 755 /opt/patent-system/backend/uploads/
```

**Database Locked**
```bash
# Check for long-running transactions
sudo lsof /opt/patent-system/backend/patent_system.db
```

**Docker Issues**
```bash
# Clean up Docker
docker system prune -a
docker-compose down --volumes
docker-compose up --build
```

### Performance Issues

**High Memory Usage**
- Monitor with `pm2 monit` or `docker stats`
- Restart services: `pm2 restart all`
- Check for memory leaks in application logs

**Slow Response Times**
- Check database query performance
- Monitor file system I/O
- Review network configuration

### Log Analysis
```bash
# Check for errors in logs
grep -i error /var/log/nginx/error.log
pm2 logs --err
docker-compose logs | grep -i error

# Monitor real-time traffic
sudo tail -f /var/log/nginx/access.log | grep -v "GET /api/health"
```

---

## Security Considerations

### Network Security
- Use firewall to restrict access to necessary ports only
- Configure SSL/TLS certificates
- Set up fail2ban for brute force protection

### Application Security
- Regular security updates for dependencies
- Input validation and sanitization
- File upload restrictions
- Rate limiting on API endpoints

### Data Security
- Regular database backups
- Secure file storage permissions
- Activity logging and monitoring
- User access auditing

---

## Scaling

### Horizontal Scaling
```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Load balancer configuration (Nginx)
upstream backend {
    server backend1:5001;
    server backend2:5001;
    server backend3:5001;
}
```

### Database Scaling
For large installations, consider:
- PostgreSQL or MySQL instead of SQLite
- Read replicas for reporting
- Connection pooling
- Query optimization

---

For additional support, refer to the [API Documentation](./API_DOCUMENTATION.md) and project [README](./README.md).