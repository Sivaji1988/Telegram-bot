require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Create bot instance for polling (message handling)
const listenerBot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Define spam patterns or keywords
const spamKeywords = [
  "bit.ly", "join group", "free offer", "discount", "http", "https", "limited time", "buy now"
];

// Listen for all messages
listenerBot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const userText = msg.text?.toLowerCase() || '';

  // Ignore messages from yourself or admins if needed
  if (msg.from.is_bot) return;

  // Check for spam keywords
  const isSpam = spamKeywords.some(keyword => userText.includes(keyword));

  if (isSpam) {
    // Delete the message
    listenerBot.deleteMessage(chatId, messageId)
      .then(() => {
        console.log(`🧹 Deleted spam: "${userText}" from ${msg.from.username || msg.from.first_name}`);
      })
      .catch((err) => {
        console.error("❌ Could not delete message:", err.response?.body?.description || err.message);
      });
  }
});
 