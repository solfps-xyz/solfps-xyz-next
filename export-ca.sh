#!/bin/bash

# Script to export CA certificate for mobile devices

echo "📱 Exporting CA certificate for mobile devices..."
echo ""

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert is not installed"
    echo "Run: brew install mkcert"
    exit 1
fi

# Get CA root directory
CAROOT=$(mkcert -CAROOT)
echo "📂 CA Root directory: $CAROOT"
echo ""

# Check if CA exists
if [ ! -f "$CAROOT/rootCA.pem" ]; then
    echo "❌ CA not found. Run: mkcert -install"
    exit 1
fi

# Copy to Desktop for easy access
cp "$CAROOT/rootCA.pem" ~/Desktop/mkcert-ca.crt
cp "$CAROOT/rootCA.pem" ~/Desktop/mkcert-ca.pem

echo "✅ CA certificate exported to Desktop!"
echo ""
echo "📲 Install on mobile:"
echo ""
echo "iOS:"
echo "  1. AirDrop ~/Desktop/mkcert-ca.pem to your iPhone"
echo "  2. Open the file and install the profile"
echo "  3. Settings → General → About → Certificate Trust Settings"
echo "  4. Enable full trust for 'mkcert'"
echo ""
echo "Android:"
echo "  1. Transfer ~/Desktop/mkcert-ca.crt to your Android device"
echo "  2. Settings → Security → Install from storage"
echo "  3. Select the certificate file"
echo ""
