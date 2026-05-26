/**
 * Minimalist Security Utility for CipherLab Pro
 * Handles Rate Limiting and API Key Verification using built-in modules.
 */

const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

function rateLimit(ip) {
  const now = Date.now();
  const userData = ipRequests.get(ip) || { count: 0, startTime: now };

  if (now - userData.startTime > RATE_LIMIT_WINDOW) {
    userData.count = 1;
    userData.startTime = now;
  } else {
    userData.count++;
  }

  ipRequests.set(ip, userData);
  return userData.count <= MAX_REQUESTS;
}

function verifyApiKey(req) {
  const apiKey = req.headers['x-api-key'];
  const masterKey = process.env.CIPHERLAB_API_KEY || 'Ipanzx123';
  return apiKey === masterKey;
}

module.exports = { rateLimit, verifyApiKey };
