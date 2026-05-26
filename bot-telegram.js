/**
 * CipherLab Pro Telegram Bot
 * 
 * Dependencies: npm install node-telegram-bot-api axios
 * Usage: Set TELEGRAM_BOT_TOKEN and API_URL (your Vercel/Local API) in .env or as environment variables.
 */

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const apiUrl = process.env.API_URL || 'http://localhost:3000';
const apiKey = process.env.CIPHERLAB_API_KEY || 'Ipanzx123'; // Must match server-side key

const bot = new TelegramBot(token, { polling: true });

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: { 'x-api-key': apiKey }
});

console.log('CipherLab Bot v1.1.0 is starting...');

const userState = {};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `
Welcome to CipherLab Pro Bot! 🛡️

Commands:
/detect - Detect encryption type of text/file
/encrypt <level> <password> - Encrypt text/file
/decrypt - Auto-decrypt text/file
/deobfuscate - Deobfuscate JavaScript

You can send text directly or upload a file (.js, .txt, etc.) after calling a command.
  `);
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `
How to use:
1. Type a command (e.g., /deobfuscate)
2. Send the text or upload a file.
3. The bot will process it using CipherLab Pro API and return the result.

Encryption Levels:
L1: Base64
L4: AES-128-CBC
L5: AES-256-GCM
  `);
});

// Generic Handler for commands
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && text.startsWith('/')) {
    const args = text.split(' ');
    const command = args[0];

    if (command === '/encrypt') {
      userState[chatId] = { action: 'encrypt', level: parseInt(args[1]) || 1, password: args[2] || 'default' };
      bot.sendMessage(chatId, `Ready to encrypt (Level ${userState[chatId].level}). Please send the text or file.`);
    } else if (command === '/detect') {
      userState[chatId] = { action: 'detect' };
      bot.sendMessage(chatId, 'Ready to detect. Please send the text or file.');
    } else if (command === '/decrypt') {
      userState[chatId] = { action: 'decrypt' };
      bot.sendMessage(chatId, 'Ready to decrypt (Auto). Please send the text or file.');
    } else if (command === '/deobfuscate') {
      userState[chatId] = { action: 'deobfuscate' };
      bot.sendMessage(chatId, 'Ready to deobfuscate JS. Please send the text or file.');
    }
    return;
  }

  // Handle Input (Text or Document)
  if (userState[chatId]) {
    let inputData = '';
    let fileName = 'result.txt';

    if (msg.document) {
      bot.sendMessage(chatId, 'Downloading file...');
      const fileId = msg.document.file_id;
      const fileLink = await bot.getFileLink(fileId);
      const response = await axios.get(fileLink);
      inputData = response.data;
      fileName = msg.document.file_name;
    } else if (msg.text) {
      inputData = msg.text;
    } else {
      return;
    }

    const state = userState[chatId];
    delete userState[chatId]; // Clear state after processing

    try {
      bot.sendMessage(chatId, 'Processing with CipherLab API...');
      let result;

      if (state.action === 'detect') {
        const res = await apiClient.post(`/api/detect`, { input: inputData });
        result = JSON.stringify(res.data, null, 2);
      } else if (state.action === 'encrypt') {
        const res = await apiClient.post(`/api/encrypt`, { 
          input: inputData, 
          level: state.level, 
          password: state.password 
        });
        result = JSON.stringify(res.data, null, 2);
      } else if (state.action === 'decrypt') {
        // First detect
        const detectRes = await apiClient.post(`/api/detect`, { input: inputData });
        const method = detectRes.data.suggestedDecryptMethod;
        if (method && method !== 'unknown') {
          const res = await apiClient.post(`/api/decrypt`, { input: inputData, method });
          result = res.data.result;
        } else {
          result = "Could not auto-detect decryption method.";
        }
      } else if (state.action === 'deobfuscate') {
        const res = await apiClient.post(`/api/deobfuscate`, { input: inputData });
        result = res.data.result;
      }

      // Return Result
      if (result.length > 4000) {
        const outPath = path.join(__dirname, `output_${fileName}`);
        fs.writeFileSync(outPath, result);
        await bot.sendDocument(chatId, outPath);
        fs.unlinkSync(outPath);
      } else {
        bot.sendMessage(chatId, `\`\`\`\n${result}\n\`\`\``, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, `Error: ${error.response?.data?.error || error.message}`);
    }
  }
});
