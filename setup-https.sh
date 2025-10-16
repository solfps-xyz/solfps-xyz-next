#!/bin/bash

# Setup script for local HTTPS development
# This script uses mkcert to create trusted local certificates

set -e

echo "🔒 Setting up local HTTPS certificates..."
echo ""

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert is not installed"
    echo ""
    echo "Please install mkcert first:"
    echo "  brew install mkcert"
    echo "  brew install nss  # if you use Firefox"
    echo ""
    exit 1
fi

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "📍 Detected local IP: $LOCAL_IP"
echo ""

# Create certificate directory
mkdir -p .cert

# Install local CA if not already installed
echo "🔐 Installing local Certificate Authority..."
mkcert -install
echo ""

# Generate certificates
echo "📜 Generating certificates for:"
echo "   - localhost"
echo "   - 127.0.0.1"
echo "   - ::1"
echo "   - $LOCAL_IP"
echo ""

mkcert -key-file .cert/localhost-key.pem \
       -cert-file .cert/localhost-cert.pem \
       localhost 127.0.0.1 ::1 $LOCAL_IP

echo ""
echo "✅ Certificates created successfully!"
echo ""
echo "📱 To trust certificates on mobile devices:"
echo ""
echo "iOS:"
echo "  1. Find your CA certificate:"
echo "     mkcert -CAROOT"
echo "  2. AirDrop rootCA.pem to your iOS device"
echo "  3. Settings → General → VPN & Device Management → Install"
echo "  4. Settings → General → About → Certificate Trust Settings"
echo "  5. Enable full trust for 'mkcert'"
echo ""
echo "Android:"
echo "  1. Copy CA certificate:"
echo "     cp \"\$(mkcert -CAROOT)/rootCA.pem\" ~/Desktop/mkcert-ca.crt"
echo "  2. Transfer to Android"
echo "  3. Settings → Security → Install from storage"
echo ""
echo "🚀 Now run:"
echo "   pnpm run dev:https"
echo ""
echo "📱 Access from mobile:"
echo "   https://$LOCAL_IP:3000"
echo ""
