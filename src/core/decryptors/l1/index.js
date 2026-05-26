class L1Decryptor {
  /**
   * Decodes Base64 encoded string.
   */
  static fromBase64(input) {
    return Buffer.from(input, 'base64').toString('utf-8');
  }

  /**
   * Decodes Hexadecimal encoded string.
   */
  static fromHex(input) {
    return Buffer.from(input, 'hex').toString('utf-8');
  }

  /**
   * Decodes URL encoded string.
   */
  static fromUrl(input) {
    return decodeURIComponent(input);
  }

  /**
   * Decodes ROT13/ROT47.
   */
  static fromROT(input, amount = 13) {
    return input.replace(/[a-zA-Z]/g, (c) => {
      const charCode = c.charCodeAt(0);
      const isUpperCase = charCode >= 65 && charCode <= 90;
      const base = isUpperCase ? 65 : 97;
      return String.fromCharCode(((charCode - base + amount) % 26) + base);
    });
  }
}

module.exports = { L1Decryptor };
