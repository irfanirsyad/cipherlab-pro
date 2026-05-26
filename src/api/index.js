const http = require('http');
const { AutoDetector } = require('../core/detector');
const { EncryptionEngine } = require('../core/encryptors');
const { L1Decryptor } = require('../core/decryptors/l1');
const { Deobfuscator } = require('../core/deobfuscator/sandbox');

const detector = new AutoDetector();

function handler(req, res) {
  const { method, url } = req;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.includes('/api/health') && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: '1.0.0', platform: 'Serverless' }));
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

  if (url.includes('/api/decrypt') && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { input, method: decryptMethod } = JSON.parse(body);
        let result = '';
        if (decryptMethod === 'base64') result = L1Decryptor.fromBase64(input);
        else if (decryptMethod === 'hex') result = L1Decryptor.fromHex(input);
        else if (decryptMethod === 'url') result = L1Decryptor.fromUrl(input);
        else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Decryption method not supported via API yet' }));
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
        const unwrapped = Deobfuscator.unwrapEval(input);
        const result = Deobfuscator.decodeEscapes(unwrapped);
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
    console.log(`CipherLab Pro API listening on http://localhost:${port}`);
  });
}

module.exports = handler;
module.exports.startServer = startServer;
