#!/bin/bash

# Base64 ile dosya yükleme
echo "Creating base64 encoded files..."

# Frontend dosyalarını encode et
tar -czf frontend.tar.gz frontend/
base64 frontend.tar.gz > frontend.b64

# Backend dosyalarını encode et  
tar -czf backend.tar.gz backend/
base64 backend.tar.gz > backend.b64

echo "Files encoded. Now copy-paste to EC2:"
echo "1. SSH to EC2"
echo "2. Create files with cat > filename.b64"
echo "3. Paste content and Ctrl+D"
echo "4. base64 -d filename.b64 > filename.tar.gz"
echo "5. tar -xzf filename.tar.gz"