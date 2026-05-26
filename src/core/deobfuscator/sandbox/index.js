const vm = require('vm');

class Deobfuscator {
  /**
   * Titan Engine: Sandbox Guard + Pattern Recovery
   */
  static unwrapEval(code) {
    // 1. Sandbox Guard (W5 Mitigation)
    if (this.isMalicious(code)) {
      return "BLOCKED: Potential Sandbox Escape detected (constructor/proto access).";
    }

    let results = [];
    const context = {
      eval: (c) => { results.push(c); return c; },
      console: { log: () => {} },
      process: null,
      require: null,
      Buffer: null
    };

    try {
      // 2. Pattern Recovery (W1 Mitigation)
      code = this.recoverStringArrays(code);
      code = this.flattenMemberExpressions(code);

      vm.createContext(context);
      vm.runInContext(code, context, { timeout: 2000 });
      
      let finalResult = results.join('\n\n') || code;
      return this.decodeEscapes(finalResult);
    } catch (e) {
      return `Error: ${e.message}`;
    }
  }

  static isMalicious(code) {
    const blacklisted = [
      /\.constructor/i,
      /__proto__/i,
      /prototype/i,
      /Function\(/i,
      /global\./i
    ];
    return blacklisted.some(pattern => pattern.test(code));
  }

  static recoverStringArrays(code) {
    const arrayRegex = /var\s+(_0x[a-f0-9]+)\s*=\s*(\[[^\]]+\])/g;
    let match;
    let newCode = code;
    while ((match = arrayRegex.exec(code)) !== null) {
      const varName = match[1];
      try {
        const arr = JSON.parse(match[2].replace(/'/g, '"'));
        const usageRegex = new RegExp(`${varName}\\[(\\d+)\\]`, 'g');
        newCode = newCode.replace(usageRegex, (m, i) => `'${arr[parseInt(i)]}'`);
      } catch (e) {}
    }
    return newCode;
  }

  static flattenMemberExpressions(code) {
    // Converts _0x123['log'] to _0x123.log
    return code.replace(/([\w$]+)\[['"]([\w$]+)['"]\]/g, '$1.$2');
  }

  static decodeEscapes(input) {
    return input.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
                .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
}

module.exports = { Deobfuscator };
