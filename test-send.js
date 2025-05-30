// Create a new quick script `test-send.js`
require('dotenv').config();
const fetch = require('node-fetch');

const testMessage = `🧪 Test message at ${new Date().toLocaleTimeString()}`;

fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: process.env.CHAT_ID,
    text: testMessage,
  })
})
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));
