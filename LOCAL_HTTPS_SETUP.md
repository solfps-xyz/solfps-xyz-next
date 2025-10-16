# Local HTTPS Setup with Custom CA

This guide will help you set up a trusted local HTTPS server for testing your game on mobile devices.

## Quick Setup with mkcert (Recommended)

The easiest way to create trusted local certificates is using `mkcert`.

### 1. Install mkcert

```bash
# On macOS
brew install mkcert
brew install nss # if you use Firefox

# Verify installation
mkcert -version
```

### 2. Create Local Certificate Authority

```bash
# Create and install local CA
mkcert -install
```

This creates a local CA and installs it in your system's trust store. You'll see output like:
```
Created a new local CA 💥
The local CA is now installed in the system trust store! ⚡️
```

### 3. Generate Certificates for Your Local Server

```bash
# Navigate to your project
cd /Users/victorevolves/Projects/Hackathons/Colosseum\ Cyberpunk/solfps_xyz_frontend

# Create certificates directory
mkdir -p .cert

# Generate certificate for localhost and your local IP
# Replace YOUR_LOCAL_IP with your actual IP (e.g., 192.168.1.100)
mkcert -key-file .cert/localhost-key.pem \
       -cert-file .cert/localhost-cert.pem \
       localhost 127.0.0.1 ::1 YOUR_LOCAL_IP.local YOUR_LOCAL_IP

# Example with a real IP:
# mkcert -key-file .cert/localhost-key.pem \
#        -cert-file .cert/localhost-cert.pem \
#        localhost 127.0.0.1 ::1 192.168.1.100.local 192.168.1.100
```

### 4. Update Your Next.js Dev Server

Create a custom server file:

**`server.js`**:
```javascript
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '.cert', 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '.cert', 'localhost-cert.pem')),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
      console.log(`> Ready on https://localhost:${port}`);
    });
});
```

### 5. Update package.json

Add a new script for HTTPS development:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "dev:https": "node server.js",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 6. Install Mobile Certificate (For iOS/Android)

#### For iOS:
1. Get your local CA root certificate:
   ```bash
   # Find where mkcert stores the CA
   mkcert -CAROOT
   ```

2. Copy the `rootCA.pem` file to your iOS device (AirDrop, email, etc.)

3. On iOS:
   - Settings → General → VPN & Device Management
   - Install the profile
   - Settings → General → About → Certificate Trust Settings
   - Enable full trust for the root certificate

#### For Android:
1. Get the CA certificate:
   ```bash
   cp "$(mkcert -CAROOT)/rootCA.pem" ~/Desktop/mkcert-ca.crt
   ```

2. Transfer to Android device

3. On Android:
   - Settings → Security → Encryption & Credentials
   - Install from storage
   - Select the certificate file
   - Name it "mkcert local CA"

### 7. Run Your HTTPS Server

```bash
# Install dependencies if needed
npm install

# Run with HTTPS
pnpm run dev:https
```

Access your app at:
- Desktop: `https://localhost:3000`
- Mobile: `https://YOUR_LOCAL_IP:3000` (e.g., `https://192.168.1.100:3000`)

---

## Alternative: Manual CA Creation (Advanced)

If you prefer to create certificates manually without mkcert:

### 1. Create CA Root Certificate

```bash
# Create directory for certificates
mkdir -p .cert
cd .cert

# Generate CA private key
openssl genrsa -out ca-key.pem 2048

# Generate CA certificate
openssl req -new -x509 -days 365 -key ca-key.pem -out ca-cert.pem \
  -subj "/C=US/ST=State/L=City/O=Dev/CN=Local Dev CA"
```

### 2. Create Server Certificate

```bash
# Generate server private key
openssl genrsa -out localhost-key.pem 2048

# Create certificate signing request
openssl req -new -key localhost-key.pem -out localhost.csr \
  -subj "/C=US/ST=State/L=City/O=Dev/CN=localhost"

# Create extensions file for Subject Alternative Names
cat > localhost.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = YOUR_LOCAL_IP.local
IP.1 = 127.0.0.1
IP.2 = ::1
IP.3 = YOUR_LOCAL_IP
EOF

# Sign the certificate with your CA
openssl x509 -req -in localhost.csr -CA ca-cert.pem -CAkey ca-key.pem \
  -CAcreateserial -out localhost-cert.pem -days 365 -sha256 \
  -extfile localhost.ext

# Clean up
rm localhost.csr localhost.ext
```

### 3. Install CA Certificate

**On macOS:**
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ca-cert.pem
```

**On Windows:**
- Double-click `ca-cert.pem`
- Install Certificate → Local Machine
- Place in "Trusted Root Certification Authorities"

### 4. Use the same `server.js` and package.json updates as above

---

## Troubleshooting

### "NET::ERR_CERT_AUTHORITY_INVALID"
- Make sure you've installed the CA certificate on your device
- On iOS, ensure you've enabled full trust in Certificate Trust Settings

### "Connection Refused"
- Check firewall settings
- Ensure your mobile device is on the same WiFi network
- Verify the IP address is correct

### Certificate Not Trusted on Mobile
- Make sure you installed the rootCA.pem on the mobile device
- Restart the browser after installing the certificate
- Clear browser cache

### Find Your Local IP Address

**On macOS:**
```bash
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

**On Linux:**
```bash
hostname -I
```

---

## Security Notes

⚠️ **Important:**
- These certificates are for **local development only**
- Never commit `.cert/` directory to version control
- Add `.cert/` to your `.gitignore`
- The CA root certificate can sign any certificate - keep it secure
- Remove the CA from your trust store when done developing

---

## .gitignore Update

Add to your `.gitignore`:
```
# Local certificates
.cert/
*.pem
*.crt
*.key
server.js
```

---

## Quick Commands Summary

```bash
# 1. Install mkcert
brew install mkcert

# 2. Create CA
mkcert -install

# 3. Get your local IP
ipconfig getifaddr en0

# 4. Generate certificates (replace YOUR_IP)
mkdir -p .cert
mkcert -key-file .cert/localhost-key.pem \
       -cert-file .cert/localhost-cert.pem \
       localhost 127.0.0.1 ::1 YOUR_IP

# 5. Create server.js (see above)

# 6. Run HTTPS server
pnpm run dev:https

# 7. Access from mobile
# https://YOUR_IP:3000
```

Now you can test your Raylib game with HTTPS on your mobile device! 🎮🔒
