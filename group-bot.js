require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  // Only respond in groups
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    if (text.includes('hello') || text.includes('hi')) {
      bot.sendMessage(chatId, `👋 Hello ${msg.from.first_name}! Welcome to the group.`);
    }

    if (text.includes('support')) {
      bot.sendMessage(chatId, `Need job support or interview help? Contact us at info@vismen.com or +91 9390981160`);
    }

    if (text.includes('java') || text.includes('selenium')) {
      bot.sendMessage(chatId, `🎯 We offer task-wise job support for Java, Selenium, and more!`);
    }

    // You can expand with more keywords and replies...
  }
});
