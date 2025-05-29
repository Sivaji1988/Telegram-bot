require('dotenv').config();
const fetch = require('node-fetch');
const cron = require('node-cron');
const { DateTime } = require('luxon');

// 1. Generate a message using OpenAI
async function generateMessage() {
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

// 2. Send text message to Telegram
async function sendMessage(text) {
  const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: text
      })
    });

    const data = await res.json();
    if (data.ok) {
      console.log('✅ Message sent successfully');
    } else {
      console.error('❌ Failed to send message:', data.description);
    }
  } catch (err) {
    console.error('❌ Telegram send error:', err.message);
  }
}

// 3. Schedule message daily at 2:01 PM IST
cron.schedule('0 * * * *', async () => {
      const message = await generateMessage();
  const timestamp = DateTime.now().setZone("Asia/Kolkata").toLocaleString(DateTime.TIME_WITH_SECONDS);
  const fullMessage = `🕒 ${timestamp}\n\n${message}`;
  await sendMessage(fullMessage);
}, { 
  timezone: 'Asia/Kolkata'
});

// Keep process running
setInterval(() => {}, 1000);
