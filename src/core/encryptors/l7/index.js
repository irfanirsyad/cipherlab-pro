const crypto = require('crypto');

class L7Encryptor {
  /**
   * Level 7: MAX Fortress Mode
   */
  static encrypt(input, password) {
    const masterKey = crypto.randomBytes(32);
    const salt = crypto.randomBytes(16);
    const protectedKey = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha512');
    
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
    let encrypted = cipher.update(input, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    const mutated = encrypted.split('').reverse().join('');

    const result = {
      version: '1.0.0',
      iv: iv.toString('hex'),
      tag: tag,
      content: mutated,
      layers: ['AES-256-GCM', 'ReverseMutation']
    };

    const keyFile = {
      salt: salt.toString('hex'),
      masterKeyEncrypted: this.xor(masterKey, protectedKey).toString('hex'),
      hint: 'PBKDF2-SHA512-310000'
    };

    return {
      content: JSON.stringify(result, null, 2),
      keyFile: JSON.stringify(keyFile, null, 2)
    };
  }

  static xor(a, b) {
    const res = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
      res[i] = a[i] ^ b[i];
    }
    return res;
  }
}

module.exports = { L7Encryptor };
