import {
  default as Baileys,
  toBuffer,
  proto,
  generateWAMessageFromContent,
  generateWAMessage,
} from '@whiskeysockets/baileys';
import pino from 'pino';

// This function wraps the main Baileys socket to add helper methods
export function makeWASocket(options) {
  const sock = Baileys({
    ...options,
    logger: pino({ level: 'silent' }), // Suppress verbose logging
  });

  // Helper function to simplify sending text messages
  sock.sendText = (jid, text, quoted = '', options) => {
    return sock.sendMessage(jid, { text, ...options }, { quoted });
  };

  // You can add more helper functions here as needed, for example:
  // sock.sendImage = ...
  // sock.sendVideo = ...

  // Re-export other useful functions if needed, or just return the wrapped socket
  return sock;
}

// Re-exporting other Baileys functions that might be used elsewhere
export * from '@whiskeysockets/baileys';