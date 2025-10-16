# 🚀 Local HTTPS Testing - Complete Setup

## ✅ What Has Been Set Up

1. **HTTPS Server Configuration** (`server.js`)
   - Custom Next.js server with HTTPS support
   - Listens on `0.0.0.0:3000` for network access
   - Uses certificates from `.cert/` directory

2. **Setup Scripts**
   - `setup-https.sh` - Automated certificate generation
   - `export-ca.sh` - Export CA certificate for mobile devices
   - Both scripts are executable

3. **Package.json Updated**
   - New script: `pnpm run dev:https` for HTTPS development
   - Existing: `pnpm run dev` for regular HTTP

4. **Documentation**
   - `LOCAL_HTTPS_SETUP.md` - Detailed setup guide
   - `HTTPS_QUICK_START.md` - Quick reference guide
   - This file - Complete setup summary

5. **Gitignore Updated**
   - `.cert/` directory excluded
   - Certificate files (*.pem, *.crt, *.key) excluded

## 🎯 Quick Start (3 Steps)

### Step 1: Install mkcert
```bash
brew install mkcert
brew install nss  # optional, for Firefox
```

### Step 2: Generate Certificates
```bash
./setup-https.sh
```

### Step 3: Start HTTPS Server
```bash
pnpm run dev:https
```

**Done!** Access your app at:
- 💻 https://localhost:3000
- 📱 https://172.24.116.161:3000

## 📱 Mobile Device Setup (One-time)

### Export CA Certificate
```bash
./export-ca.sh
```

This copies the CA certificate to your Desktop.

### iOS Installation
1. AirDrop `mkcert-ca.pem` to your iPhone/iPad
2. Tap the file → Install Profile
3. Settings → General → VPN & Device Management → Install
4. Settings → General → About → Certificate Trust Settings
5. Enable full trust for "mkcert"

### Android Installation
1. Transfer `mkcert-ca.crt` to your Android device
2. Settings → Security → Encryption & Credentials
3. Install a certificate → CA certificate
4. Browse and select the file

## 🔍 Verification

### On Desktop
```bash
# Start HTTPS server
pnpm run dev:https

# Open in browser
open https://localhost:3000
```

You should see a green padlock 🔒 (no warnings)

### On Mobile
1. Connect to same WiFi network
2. Open browser
3. Navigate to `https://172.24.116.161:3000`
4. Should load without certificate warnings

## 🎮 Testing Device Detection

Once running, your game can detect:
- Mobile vs Desktop vs Tablet
- Screen size (width/height)
- Device orientation
- Touch support

The WASM bridge automatically scales muzzle flash:
- 📱 Mobile: 50% size
- 📱 Tablet: 75% size
- 💻 Desktop: 100% size

## 📂 Project Structure

```
solfps_xyz_frontend/
├── .cert/                    # SSL certificates (gitignored)
│   ├── localhost-key.pem
│   └── localhost-cert.pem
├── server.js                 # Custom HTTPS server
├── setup-https.sh           # Certificate setup script
├── export-ca.sh             # Mobile CA export script
├── LOCAL_HTTPS_SETUP.md     # Detailed guide
├── HTTPS_QUICK_START.md     # Quick reference
└── SETUP_COMPLETE.md        # This file
```

## 🐛 Troubleshooting

### Certificate Error on Mobile
**Problem:** "NET::ERR_CERT_AUTHORITY_INVALID"

**Solution:**
1. Make sure CA is installed on device
2. On iOS: Enable "Full Trust" in Certificate Trust Settings
3. Restart browser
4. Clear browser cache

### Can't Connect from Mobile
**Problem:** Connection refused or timeout

**Solution:**
1. Verify both devices on same WiFi
2. Check IP address: `ifconfig | grep "inet "`
3. Check firewall settings (allow port 3000)
4. Restart HTTPS server

### Certificate Expired
**Problem:** Certificate no longer trusted

**Solution:**
```bash
# Regenerate certificates
./setup-https.sh

# Restart server
pnpm run dev:https
```

### Server Won't Start
**Problem:** Error loading certificates

**Solution:**
```bash
# Make sure certificates exist
ls -la .cert/

# If missing, run setup again
./setup-https.sh
```

## 🔄 Common Commands

```bash
# Generate/regenerate certificates
./setup-https.sh

# Export CA for mobile
./export-ca.sh

# Start HTTPS server
pnpm run dev:https

# Start regular HTTP server
pnpm run dev

# Check your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Find CA location
mkcert -CAROOT

# Remove CA (when done)
mkcert -uninstall
```

## 🔐 Security Notes

⚠️ **Important:**
- Certificates are for **local development only**
- Never commit `.cert/` to git (it's gitignored)
- CA can sign any certificate - keep it secure
- Uninstall CA when done: `mkcert -uninstall`

## 📊 What's Different?

### Regular HTTP (`pnpm run dev`)
- ❌ No certificate warnings
- ❌ But some features require HTTPS (camera, location, etc.)
- ✅ Simple setup
- 🌐 http://localhost:3000

### HTTPS (`pnpm run dev:https`)
- ✅ Trusted certificates
- ✅ All browser features work
- ✅ Same as production environment
- 🔒 https://localhost:3000

## 🎯 Current Configuration

- **Local IP:** 172.24.116.161
- **HTTPS Port:** 3000
- **Certificates:** `.cert/localhost-{key,cert}.pem`
- **CA Location:** Run `mkcert -CAROOT` to see

## ✨ Next Steps

1. **Run setup script:**
   ```bash
   ./setup-https.sh
   ```

2. **Start HTTPS server:**
   ```bash
   pnpm run dev:https
   ```

3. **Test on desktop:**
   - Open https://localhost:3000
   - Verify green padlock

4. **Setup mobile:**
   ```bash
   ./export-ca.sh  # Export CA to Desktop
   # Then AirDrop/transfer to mobile and install
   ```

5. **Test on mobile:**
   - Open https://172.24.116.161:3000
   - Test device detection features
   - Verify muzzle flash scaling

## 🎉 You're Ready!

Everything is set up for local HTTPS testing. Just run:

```bash
./setup-https.sh && pnpm run dev:https
```

Then access from mobile at: **https://172.24.116.161:3000**

Happy testing! 🎮🔒📱
