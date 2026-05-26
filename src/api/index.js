const http = require('http');
const fs = require('fs');
const path = require('path');
const { AutoDetector } = require('../core/detector');
const { EncryptionEngine } = require('../core/encryptors');
const { L7Encryptor } = require('../core/encryptors/l7');
const { Deobfuscator } = require('../core/deobfuscator/sandbox');
const { BinaryAnalyzer } = require('../utils/binary');
const { rateLimit, verifyApiKey } = require('../utils/security');

const detector = new AutoDetector();

function handler(req, res) {
  const { method, url } = req;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve Web Dashboard (GUI)
  if (url === '/' || url === '/index.html') {
    const filePath = path.join(__dirname, '../../public/index.html');
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  // Rate Limiting
  if (!rateLimit(clientIp)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
    return;
  }

  // Public Health Check
  if (url.includes('/api/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: '1.2.0', platform: 'Titanium' }));
    return;
  }

  // API Key Verification
  if (!verifyApiKey(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // API Endpoints
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      const input = data.input || '';

      if (url.includes('/api/detect')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(detector.detect(input)));
      } 
      else if (url.includes('/api/deobfuscate')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: Deobfuscator.unwrapEval(input) }));
      }
      else if (url.includes('/api/analyze')) {
        const buffer = Buffer.from(input, input.startsWith('data:') ? 'base64' : 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(BinaryAnalyzer.analyze(buffer)));
      }
      else if (url.includes('/api/encrypt')) {
        const { level, password } = data;
        let result;
        if (level === 7) {
          result = L7Encryptor.encrypt(input, password || 'default');
        } else if (level === 5) {
          result = { result: EncryptionEngine.toAES256GCM(input, password || 'default') };
        } else {
          result = { result: EncryptionEngine.toBase64(input) };
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      }
      else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid Input: ' + e.message }));
    }
  });
}

function startServer(port = 3000) {
  const server = http.createServer(handler);
  server.listen(port, () => {
    console.log(`CipherLab Pro v1.2.0 (Titanium) listening on http://localhost:${port}`);
  });
}

module.exports = handler;
module.exports.startServer = startServer;
