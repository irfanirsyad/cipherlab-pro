const crypto = require('crypto');

class EncryptionEngine {
  /**
   * Level 1: Base64 Encoding
   */
  static toBase64(input) {
    return Buffer.from(input).toString('base64');
  }

  /**
   * Level 1: Hex Encoding
   */
  static toHex(input) {
    return Buffer.from(input).toString('hex');
  }

  /**
   * Level 4: AES-128-CBC
   */
  static toAES128CBC(input, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-128-cbc', crypto.scryptSync(key, 'salt', 16), iv);
    let encrypted = cipher.update(input, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: iv.toString('hex'),
      content: encrypted
    };
  }

  /**
   * Level 5: AES-256-GCM
   */
  static toAES256GCM(input, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', crypto.scryptSync(key, 'salt', 32), iv);
    let encrypted = cipher.update(input, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return {
      iv: iv.toString('hex'),
      content: encrypted,
      tag: tag
    };
  }
}

module.exports = { EncryptionEngine };
