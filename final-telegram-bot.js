require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const fetch = require('node-fetch');
const { DateTime } = require('luxon');

// Initialize bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

/** 🧹 Spam Control **/
const spamKeywords = [
  "bit.ly", "join group", "free offer", "100%", "discount", "http", "https",
  "limited time", "buy now", "low price", "pay after demo", "no upfront", "reliable "
];

/** 🤖 On Every Group Message **/
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase() || '';
  const messageId = msg.message_id;
  const isBot = msg.from?.is_bot;
  const isOwner = msg.from?.id === parseInt(process.env.OWNER_ID);

  // Skip self or owner messages
  if (isBot || isOwner) return;

  /** 1. Check and delete spam **/
  const isSpam = spamKeywords.some(keyword => text.includes(keyword));
  if (isSpam) {
    try {
      await bot.deleteMessage(chatId, messageId);
      console.log(`🧹 Deleted spam: "${text}" from ${msg.from.username || msg.from.first_name}`);
      return;
    } catch (err) {
      console.error("❌ Failed to delete spam:", err.message);
    }
  }

  /** 2. Auto response logic for valid users **/
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    if (text.includes('hello') || text.includes('hi')) {
      await bot.sendMessage(chatId, `👋 Hello ${msg.from.first_name}! Welcome to the group.`);
    }

    if (text.includes('support')) {
      await bot.sendMessage(chatId, `💬 Need job support or interview help? Contact us at info@vismen.com or +91 9390981160`);
    }

    if (text.includes('java') || text.includes('selenium')) {
      await bot.sendMessage(chatId, `🎯 We offer task-wise job support for Java, Selenium, and more!`);
    }
  }
});

/** 📣 Scheduled Promotional Message using OpenAI **/
async function generatePromoMessage() {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{
          role: "user",
          content: "Write only one short and unique promotional message (not a list) for VISMEN IT SOLUTIONS. Emphasize that we offer interview support before the job, and task-wise job support after placement. Mention every technologies like Selenium, Java, AWS, Angular, Playwright, DevOPs etc. Include contact info@vismen.com, +91 9390981160, and a call to action to join our Telegram channel. The message should be friendly, under 280 characters, and not repeated. Output just one message, not a list."
        }]
      })
    });

    const data = await response.json();
    const baseMessage = data.choices[0].message.content;
    const finalMessage = `${baseMessage}\n\n📲 Join our Telegram: ${process.env.TELEGRAM_CHANNEL_LINK}`;
    return finalMessage;

  } catch (error) {
    console.error("❌ OpenAI error:", error.message);
    return "⚠️ Could not generate today's message.";
  }
}

/** ⏰ Cron Timers **/
const scheduleTimes = ['0 9 * * *', '0 12 * * *', '0 17 * * *', '0 21 * * *', '0 0 * * *']; // IST

scheduleTimes.forEach(time => {
  cron.schedule(time, async () => {
    const message = await generatePromoMessage();
    const timestamp = DateTime.now().setZone("Asia/Kolkata").toLocaleString(DateTime.TIME_WITH_SECONDS);
    const fullMessage = `🕒 ${timestamp}\n\n${message}`;
    await bot.sendMessage(process.env.CHAT_ID, fullMessage);
  }, {
    timezone: 'Asia/Kolkata'
  });
});

/** 🔁 Keep process alive on Railway or local **/
setInterval(() => {}, 1000);
