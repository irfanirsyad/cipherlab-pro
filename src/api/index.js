const http = require('http');
const { AutoDetector } = require('../core/detector');
const { EncryptionEngine } = require('../core/encryptors');
const { L1Decryptor } = require('../core/decryptors/l1');
const { Deobfuscator } = require('../core/deobfuscator/sandbox');
const { rateLimit, verifyApiKey } = require('../utils/security');

const detector = new AutoDetector();

function handler(req, res) {
  const { method, url } = req;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Rate Limiting Check
  if (!rateLimit(clientIp)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Too many requests. Please wait 1 minute.' }));
    return;
  }

  // 2. Health Check (Public)
  if (url.includes('/api/health') && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: '1.1.0', security: 'Enabled' }));
    return;
  }

  // 3. Authenticated Endpoints
  if (!verifyApiKey(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized. Invalid or missing X-API-KEY header.' }));
    return;
  }

  if (url.includes('/api/detect') && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { input } = JSON.parse(body);
        const result = detector.detect(input);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (url.includes('/api/encrypt') && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { input, level, password } = JSON.parse(body);
        let result = '';
        if (level === 1) result = EncryptionEngine.toBase64(input);
        else if (level === 4) result = EncryptionEngine.toAES128CBC(input, password || 'default');
        else if (level === 5) result = EncryptionEngine.toAES256GCM(input, password || 'default');
        else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Level not supported' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (url.includes('/api/deobfuscate') && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { input } = JSON.parse(body);
        const result = Deobfuscator.unwrapEval(input);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found', url }));
}

function startServer(port = 3000) {
  const server = http.createServer(handler);
  server.listen(port, () => {
    console.log(`CipherLab Pro v1.1.0 API listening on http://localhost:${port}`);
  });
}

module.exports = handler;
module.exports.startServer = startServer;
