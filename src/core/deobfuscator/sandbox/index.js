const vm = require('vm');

class Deobfuscator {
  /**
   * Attempts to unwrap eval() chains using a sandbox.
   */
  static unwrapEval(code) {
    let results = [];
    const context = {
      eval: (c) => {
        results.push(c);
        return c;
      },
      console: { log: () => {} }
    };

    try {
      vm.createContext(context);
      vm.runInContext(code, context, { timeout: 1000 });
      return results.join('\n\n') || code;
    } catch (e) {
      return `Error during deobfuscation: ${e.message}`;
    }
  }

  /**
   * Basic string-based deobfuscation (Hex/Unicode escape)
   */
  static decodeEscapes(input) {
    return input.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    }).replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }
}

module.exports = { Deobfuscator };
