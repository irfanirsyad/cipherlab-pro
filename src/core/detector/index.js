const { calculateEntropy } = require('../../utils/entropy');

class AutoDetector {
  /**
   * Detects the encryption/encoding type of the input string.
   */
  detect(input) {
    const entropy = calculateEntropy(input);
    
    // Level 1: Basic Encoding
    if (this.isBase64(input)) {
      return { type: 'Base64', level: 1, confidence: 0.9, suggestedDecryptMethod: 'base64' };
    }
    if (this.isHex(input)) {
      return { type: 'Hexadecimal', level: 1, confidence: 0.9, suggestedDecryptMethod: 'hex' };
    }
    if (this.isUrlEncoded(input)) {
      return { type: 'URL Encoding', level: 1, confidence: 0.8, suggestedDecryptMethod: 'url' };
    }

    // Level 2: Simple Cipher / Obfuscation hints
    if (this.isROT(input)) {
      return { type: 'ROT13/47', level: 1, confidence: 0.7, suggestedDecryptMethod: 'rot' };
    }

    // High entropy detection
    if (entropy > 7.0) {
      return { type: 'Encrypted/High Entropy', level: 4, confidence: 0.6, suggestedDecryptMethod: 'unknown' };
    }

    // JavaScript Deobfuscation hints
    if (input.includes('eval(') || input.includes('String.fromCharCode(')) {
      return { type: 'JavaScript Obfuscation', level: 3, confidence: 0.7, suggestedDecryptMethod: 'deobfuscate' };
    }

    return { type: 'Plaintext', level: 0, confidence: 0.5 };
  }

  isBase64(str) {
    if (str.length % 4 !== 0) return false;
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(str);
  }

  isHex(str) {
    if (str.length % 2 !== 0) return false;
    const hexRegex = /^[0-9a-fA-F]+$/;
    return hexRegex.test(str);
  }

  isUrlEncoded(str) {
    return /%[0-9a-fA-F]{2}/.test(str);
  }

  isROT(str) {
    const entropy = calculateEntropy(str);
    return entropy > 4.0 && entropy < 5.5 && /^[A-Za-z0-9\s]+$/.test(str);
  }
}

module.exports = { AutoDetector };
