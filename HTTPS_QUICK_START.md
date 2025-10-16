# 🔒 Quick HTTPS Setup for Mobile Testing

Your local IP: **172.24.116.161**

## Step 1: Install mkcert

```bash
brew install mkcert
brew install nss  # if you use Firefox
```

## Step 2: Run Setup Script

```bash
./setup-https.sh
```

This will:
- Install a local Certificate Authority
- Generate SSL certificates for localhost and your local IP (172.24.116.161)
- Create certificates in the `.cert/` directory

## Step 3: Start HTTPS Server

```bash
pnpm run dev:https
```

Your app will be available at:
- 💻 Desktop: https://localhost:3000
- 📱 Mobile: https://172.24.116.161:3000

## Step 4: Trust Certificate on Mobile (One-time)

### For iPhone/iPad:

1. Get your CA certificate location:
   ```bash
   mkcert -CAROOT
   ```

2. Find the `rootCA.pem` file and AirDrop it to your iOS device

3. On iOS:
   - Open the file → Install Profile
   - Settings → General → VPN & Device Management
   - Tap the profile and Install
   - Settings → General → About → Certificate Trust Settings
   - Enable "mkcert" certificate

### For Android:

1. Export certificate:
   ```bash
   cp "$(mkcert -CAROOT)/rootCA.pem" ~/Desktop/mkcert-ca.crt
   ```

2. Transfer to Android (USB, email, etc.)

3. On Android:
   - Settings → Security → Encryption & Credentials
   - Install a certificate → CA certificate
   - Select the file

## Troubleshooting

### "NET::ERR_CERT_AUTHORITY_INVALID"
- Make sure you installed the CA certificate on your mobile device
- On iOS, enable full trust in Certificate Trust Settings
- Restart your browser

### Can't connect from mobile
- Make sure both devices are on the same WiFi
- Check firewall settings (allow port 3000)
- Verify IP address: `ifconfig | grep "inet " | grep -v 127.0.0.1`

### Certificate expired
- Regenerate: `./setup-https.sh`

## Files Created

- `.cert/localhost-key.pem` - Private key
- `.cert/localhost-cert.pem` - SSL certificate
- `server.js` - Custom HTTPS server
- `setup-https.sh` - Setup automation script

⚠️ **Note:** The `.cert/` directory is gitignored and should never be committed!

## Back to Regular HTTP

```bash
pnpm run dev
```

---

Happy testing! 🎮📱
