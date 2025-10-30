#!/bin/bash

echo "🚀 GitHub Deploy to EC2..."

# GitHub'a push et
git add .
git commit -m "Deploy $(date)"
git push origin main

# EC2'da güncelle
ssh -i your-key.pem ubuntu@3.127.214.141 << 'EOF'
    cd zirvetelekom
    
    # Git pull
    git pull origin main
    
    # Backend dependencies güncelle
    cd backend
    npm install --production
    cd ..
    
    # PM2 restart
    pm2 restart zirvetelekom
    
    # Nginx reload
    sudo systemctl reload nginx
    
    echo "✅ Deploy complete!"
EOF

echo "🎉 Deployment finished!"