#!/bin/bash

# EC2 deployment script
echo "Deploying to EC2..."

# Zip project files
zip -r zirvetelekom.zip . -x "node_modules/*" "*.log" ".git/*"

# Upload to EC2 (replace with your details)
scp -i your-key.pem zirvetelekom.zip ubuntu@3.127.214.141:~/

# SSH and deploy
ssh -i your-key.pem ubuntu@3.127.214.141 << 'EOF'
    # Extract files
    unzip -o zirvetelekom.zip
    cd zirvetelekom/backend
    
    # Install dependencies
    npm install --production
    
    # Start with PM2
    pm2 stop zirvetelekom || true
    pm2 start server.js --name zirvetelekom
    pm2 save
    pm2 startup
EOF

echo "Deployment complete!"