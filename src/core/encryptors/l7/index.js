const crypto = require('crypto');

class L7Encryptor {
  /**
   * Level 7: Titanium Fortress
   * Improvements: Recovery Key Mnemonic generation (W3 Mitigation).
   */
  static encrypt(input, password) {
    const masterKey = crypto.randomBytes(32);
    const salt = crypto.randomBytes(16);
    const recoverySalt = crypto.randomBytes(16);
    
    // Recovery Key is a long random string (simulating mnemonic)
    const recoveryKey = crypto.randomBytes(24).toString('base64');
    
    const protectedKey = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha512');
    const recoveryProtectedKey = crypto.pbkdf2Sync(recoveryKey, recoverySalt, 310000, 32, 'sha512');
    
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
    let encrypted = cipher.update(input, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    const keyMetadata = {
      salt: salt.toString('hex'),
      recoverySalt: recoverySalt.toString('hex'),
      masterKeyEncrypted: this.xor(masterKey, protectedKey).toString('hex'),
      masterKeyRecoveryEncrypted: this.xor(masterKey, recoveryProtectedKey).toString('hex'),
      hint: 'PBKDF2-SHA512'
    };

    const result = {
      version: '1.2.0',
      header: Buffer.from(JSON.stringify(keyMetadata)).toString('base64'),
      iv: iv.toString('hex'),
      tag: tag,
      content: encrypted.split('').reverse().join(''),
      layers: ['AES-256-GCM', 'ReverseMutation', 'RecoveryLayer']
    };

    return {
      content: JSON.stringify(result, null, 2),
      recoveryKey: recoveryKey // MUST BE SAVED BY USER
    };
  }

  static xor(a, b) {
    const res = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) res[i] = a[i] ^ b[i];
    return res;
  }
}

module.exports = { L7Encryptor };
