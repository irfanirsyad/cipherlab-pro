const vm = require('vm');

class Deobfuscator {
  /**
   * Advanced Deobfuscation: Handles eval() chains and basic String Array Mapping.
   */
  static unwrapEval(code) {
    let results = [];
    
    // Improved Sandbox: Null out potentially dangerous globals
    const context = {
      eval: (c) => { results.push(c); return c; },
      console: { log: () => {} },
      process: null,
      require: null,
      module: null,
      Buffer: null
    };

    try {
      // 1. Pre-process: Detect and recover common String Array Obfuscation patterns
      // Example: var _0x1234 = ['a', 'b', 'c']; ... _0x1234[0]
      code = this.recoverStringArrays(code);

      // 2. Run in isolated context
      vm.createContext(context);
      vm.runInContext(code, context, { timeout: 2000 });
      
      let finalResult = results.join('\n\n') || code;
      
      // 3. Post-process: Decode remaining escapes
      return this.decodeEscapes(finalResult);
    } catch (e) {
      return `Error during deobfuscation: ${e.message}\nInput might be partially recovered or requires custom handling.`;
    }
  }

  /**
   * Recovers string arrays commonly used by obfuscator.io
   * This is a simplified regex-based recovery (simulating AST traversal)
   */
  static recoverStringArrays(code) {
    // Regex to find: var _0x... = ['...', '...'];
    const arrayRegex = /var\s+(_0x[a-f0-9]+)\s*=\s*(\[[^\]]+\])/g;
    let match;
    let newCode = code;

    while ((match = arrayRegex.exec(code)) !== null) {
      const varName = match[1];
      try {
        const arr = JSON.parse(match[2].replace(/'/g, '"')); // Simple convert to valid JSON
        
        // Find and replace usages like _0x1234[0]
        const usageRegex = new RegExp(`${varName}\\[(\\d+)\\]`, 'g');
        newCode = newCode.replace(usageRegex, (m, index) => {
          return `'${arr[parseInt(index)]}'`;
        });
      } catch (e) { /* skip if malformed */ }
    }
    return newCode;
  }

  static decodeEscapes(input) {
    return input.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    }).replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }
}

module.exports = { Deobfuscator };
