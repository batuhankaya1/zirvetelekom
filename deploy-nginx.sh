#!/bin/bash

echo "🚀 Deploying ZirveTelekom to Nginx..."

# Server details
SERVER_IP="your-server-ip"
SERVER_USER="root"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf zirvetelekom.tar.gz --exclude='node_modules' --exclude='.git' --exclude='*.log' .

# Upload to server
echo "📤 Uploading to server..."
scp zirvetelekom.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Deploy on server
echo "🔧 Deploying on server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    # Stop existing services
    pm2 stop zirvetelekom || true
    
    # Create directories
    mkdir -p /var/www/zirvetelekom
    
    # Extract files
    cd /var/www/zirvetelekom
    tar -xzf /tmp/zirvetelekom.tar.gz
    
    # Install dependencies
    cd backend
    npm install --production
    
    # Install PM2 globally
    npm install -g pm2
    
    # Setup Nginx
    cp ../nginx-site.conf /etc/nginx/sites-available/zirvetelekom
    ln -sf /etc/nginx/sites-available/zirvetelekom /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    
    # Start application
    cd /var/www/zirvetelekom
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup
    
    # Setup firewall
    ufw allow 22
    ufw allow 80
    ufw allow 443
    ufw --force enable
    
    echo "✅ Deployment complete!"
EOF

# Cleanup
rm zirvetelekom.tar.gz

echo "🎉 ZirveTelekom deployed successfully!"
echo "🌐 Visit: http://$SERVER_IP"