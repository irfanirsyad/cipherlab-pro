const fs = require('fs');
const { AutoDetector } = require('../core/detector');
const { L1Decryptor } = require('../core/decryptors/l1');
const { EncryptionEngine } = require('../core/encryptors');
const { L7Encryptor } = require('../core/encryptors/l7');
const { Deobfuscator } = require('../core/deobfuscator/sandbox');
const { startServer } = require('../api');

function printHelp() {
  console.log(`
CipherLab Pro v1.0.0
Usage: cipherlab <command> [options]

Commands:
  detect <input>          Auto-detect encryption type
  decrypt <input> --auto  Decrypt input automatically
  encrypt <input> --level <n>  Encrypt input with level n
  deobfuscate <input>     Deobfuscate JavaScript code
  serve                   Start REST API server

Options:
  --output, -o <path>     Output file path
  --password, -p <pass>   Password for L4-L7
  --port <number>         Port for API server (default 3000)
  `);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  const detector = new AutoDetector();

  switch (command) {
    case 'detect': {
      const input = args[1];
      if (!input) {
        console.error('Error: No input provided');
        return;
      }
      const data = fs.existsSync(input) ? fs.readFileSync(input, 'utf-8') : input;
      const result = detector.detect(data);
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'decrypt': {
      const input = args[1];
      const isAuto = args.includes('--auto');
      if (!input) {
        console.error('Error: No input provided');
        return;
      }
      const data = fs.existsSync(input) ? fs.readFileSync(input, 'utf-8') : input;
      
      if (isAuto) {
        const detection = detector.detect(data);
        console.log(`Detected: ${detection.type} (Level ${detection.level})`);
        
        let result = '';
        if (detection.type === 'Base64') result = L1Decryptor.fromBase64(data);
        else if (detection.type === 'Hexadecimal') result = L1Decryptor.fromHex(data);
        else if (detection.type === 'URL Encoding') result = L1Decryptor.fromUrl(data);
        else {
          console.error('Auto-decryption not supported for this type yet.');
          return;
        }
        console.log('Result:', result);
      }
      break;
    }

    case 'deobfuscate': {
      const input = args[1];
      if (!input) {
        console.error('Error: No input provided');
        return;
      }
      const data = fs.existsSync(input) ? fs.readFileSync(input, 'utf-8') : input;
      console.log('--- DEOBFUSCATING ---');
      const unwrapped = Deobfuscator.unwrapEval(data);
      const cleaned = Deobfuscator.decodeEscapes(unwrapped);
      console.log(cleaned);
      break;
    }

    case 'encrypt': {
      const input = args[1];
      const levelIdx = args.indexOf('--level');
      const level = levelIdx !== -1 ? parseInt(args[levelIdx + 1]) : 1;
      const passIdx = args.indexOf('--password');
      const password = passIdx !== -1 ? args[passIdx + 1] : 'default';

      if (!input) {
        console.error('Error: No input provided');
        return;
      }
      const data = fs.existsSync(input) ? fs.readFileSync(input, 'utf-8') : input;

      if (level === 7) {
        console.warn('WARNING: Level 7 is ONE-WAY FORTRESS. Ensure you save the master key file.');
        const { content, keyFile } = L7Encryptor.encrypt(data, password);
        console.log('--- ENCRYPTED CONTENT ---');
        console.log(content);
        console.log('\n--- MASTER KEY FILE (SAVE THIS) ---');
        console.log(keyFile);
        
        const outIdx = args.indexOf('--output');
        if (outIdx !== -1) {
          const outPath = args[outIdx + 1];
          fs.writeFileSync(outPath, content);
          fs.writeFileSync(outPath + '.key', keyFile);
          console.log(`\nFiles saved to ${outPath} and ${outPath}.key`);
        }
        return;
      }

      let result = '';
      if (level === 1) result = EncryptionEngine.toBase64(data);
      else if (level === 4) result = EncryptionEngine.toAES128CBC(data, password);
      else if (level === 5) result = EncryptionEngine.toAES256GCM(data, password);
      else {
        console.error(`Encryption level ${level} not implemented yet.`);
        return;
      }
      console.log('Encrypted Output:', JSON.stringify(result, null, 2));
      break;
    }

    case 'serve': {
      const portIdx = args.indexOf('--port');
      const port = portIdx !== -1 ? parseInt(args[portIdx + 1]) : 3000;
      startServer(port);
      break;
    }

    default:
      console.log('Unknown command:', command);
      printHelp();
  }
}

main().catch(console.error);
