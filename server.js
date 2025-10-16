const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const certPath = path.join(__dirname, '.cert');
const httpsOptions = {
  key: fs.readFileSync(path.join(certPath, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(certPath, 'localhost-cert.pem')),
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
      console.log('\n🔒 HTTPS Server Ready!\n');
      console.log(`   Local:   https://localhost:${port}`);
      console.log(`   Network: https://0.0.0.0:${port}`);
      console.log('\n   Get your local IP with: ipconfig getifaddr en0');
      console.log('   Then access from mobile: https://YOUR_IP:3000\n');
    });
});
