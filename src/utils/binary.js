/**
 * Binary Analysis Utility
 * Identifies file types via Magic Bytes and extracts printable strings.
 */

const MAGIC_BYTES = {
  '89504e47': 'PNG Image',
  '47494638': 'GIF Image',
  'ffd8ffe0': 'JPEG Image',
  '25504446': 'PDF Document',
  '504b0304': 'ZIP/Office Archive',
  '7f454c46': 'ELF Binary (Linux)',
  '4d5a': 'MZ Executable (Windows)',
  'cafebabe': 'Java Class File',
  '2321': 'Shebang Script'
};

class BinaryAnalyzer {
  static analyze(buffer) {
    const hex = buffer.toString('hex', 0, 4);
    let type = 'Unknown Binary / Text';
    
    for (const signature in MAGIC_BYTES) {
      if (hex.startsWith(signature)) {
        type = MAGIC_BYTES[signature];
        break;
      }
    }

    return {
      type,
      size: buffer.length,
      entropy: this.calculateEntropy(buffer),
      strings: this.extractStrings(buffer)
    };
  }

  static extractStrings(buffer, minLen = 4) {
    const strings = [];
    let current = '';
    
    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i];
      if (char >= 32 && char <= 126) {
        current += String.fromCharCode(char);
      } else {
        if (current.length >= minLen) strings.push(current);
        current = '';
      }
    }
    return strings.slice(0, 100); // Limit to first 100 strings
  }

  static calculateEntropy(buffer) {
    const frequencies = new Array(256).fill(0);
    for (let i = 0; i < buffer.length; i++) frequencies[buffer[i]]++;
    
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (frequencies[i] > 0) {
        const p = frequencies[i] / buffer.length;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  }
}

module.exports = { BinaryAnalyzer };
