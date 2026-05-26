# CipherLab Pro v1.0.0
Universal Encryption & Decryption Tool

## Features
- **Auto-Detection:** Automatically identify Base64, Hex, URL encoding, and more.
- **Multi-Level Encryption:** From basic encoding (L1) to Fortress Mode (L7).
- **JS Deobfuscation:** Basic eval() unwrapping and escape decoding.
- **CLI & REST API:** Use via terminal or as a service.

## Usage

### Run via Node.js
```bash
# Detect encryption type
node src/cli/index.js detect "SGVsbG8="

# Auto-decrypt
node src/cli/index.js decrypt "SGVsbG8=" --auto

# Encrypt with Level 4 (AES-128-CBC)
node src/cli/index.js encrypt "Secret Data" --level 4 --password mypass

# Encrypt with Level 7 (Fortress Mode)
node src/cli/index.js encrypt "Highly Sensitive Data" --level 7 --password supersecret

# Deobfuscate JS
node src/cli/index.js deobfuscate "eval('\x63\x6f\x6e\x73\x6f\x6c\x65\x2e\x6c\x6f\x67\x28\x22\x48\x65\x6c\x6c\x6f\x22\x29')"

# Start REST API Server
node src/cli/index.js serve --port 3000
```

### REST API Endpoints
- `GET /api/health` - Check service status
- `POST /api/detect` - JSON Body: `{ "input": "..." }`
- `POST /api/encrypt` - JSON Body: `{ "input": "...", "level": 1, "password": "..." }`

## Project Structure
- `src/core/detector`: Identification engine
- `src/core/decryptors`: Decryption modules (L1 implemented)
- `src/core/encryptors`: Encryption modules (L1, L4, L5, L7 implemented)
- `src/core/deobfuscator`: JS deobfuscation sandbox
- `src/api`: HTTP server implementation
- `src/cli`: Command-line interface
