/**
 * Calculate Shannon Entropy of a string to assess level of encryption/compression.
 * Plain text typically has entropy between 3-5.
 * Encrypted/Compressed data typically has entropy > 7.
 */
function calculateEntropy(data) {
  const str = data.toString();
  if (str.length === 0) return 0;

  const frequencies = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

module.exports = { calculateEntropy };
