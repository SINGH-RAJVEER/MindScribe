const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { getCurrentUser } = require("./auth");
const { CRISIS_WORDS, DETECT_MOOD } = require("./moodCrisisData");
const db = require("./database");

// Simulated chat response function (replace with real integration if needed)
const getChatResponse = (userMessage) => {
  // Here you might call an external API/model
  return `Simulated response to: ${userMessage}`;
};

const detectMood = (userMessage) => {
  const lower = userMessage.toLowerCase();
  for (const [mood, keywords] of Object.entries(DETECT_MOOD)) {
    if (keywords.some((word) => lower.includes(word))) {
      return mood;
    }
  }
  return null;
};

const createNewConversation = (userId, conversationId, callback) => {
  db.run("INSERT INTO conversations (id, user_id) VALUES (?, ?)", [conversationId, userId], callback);
};

const storeChat = (userId, conversationId, userMessage, botResponse, mood, isCrisis, callback) => {
  const messageId = uuidv4();
  db.run(
    `INSERT INTO messages (id, user_id, conversation_id, user_message, bot_response, mood, is_crisis, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [messageId, userId, conversationId, userMessage, botResponse, mood, isCrisis],
    callback
  );
};

// POST /chat/
router.post("/", getCurrentUser, (req, res) => {
  const { user } = req;
  let { user_message, conversation_id } = req.body;
  const isCrisis = CRISIS_WORDS.some(word => user_message.toLowerCase().includes(word));
  const mood = detectMood(user_message);

  if (!conversation_id) {
    conversation_id = uuidv4();
    createNewConversation(user.id, conversation_id, (err) => {
      if (err) return res.status(500).json({ detail: err.message });
      processChat();
    });
  } else {
    processChat();
  }

  function processChat() {
    let responseText;
    if (isCrisis)
      responseText = "Please seek professional help. You're not alone ❤️.";
    else 
      responseText = getChatResponse(user_message);
      
    storeChat(user.id, conversation_id, user_message, responseText, mood, isCrisis, (err) => {
      if (err) return res.status(500).json({ detail: err.message });
      res.json({ response: responseText, conversation_id, mood });
    });
  }
});

// GET /chat/history
router.get("/history", getCurrentUser, (req, res) => {
  const { user } = req;
  const limit = req.query.limit || 10;
  db.all(
    `SELECT conversation_id, user_message, bot_response, mood, is_crisis, timestamp 
     FROM messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?`,
    [user.id, limit],
    (err, rows) => {
      if (err) return res.status(500).json({ detail: err.message });
      // Group messages by conversation_id
      const conversations = {};
      rows.forEach((row) => {
        if (!conversations[row.conversation_id])
          conversations[row.conversation_id] = { id: row.conversation_id, messages: [], timestamp: row.timestamp };
        conversations[row.conversation_id].messages.push({
          id: uuidv4(),
          user_message: row.user_message,
          bot_response: row.bot_response,
          mood: row.mood,
          is_crisis: row.is_crisis,
          timestamp: row.timestamp
        });
      });
      res.json({ history: Object.values(conversations) });
    }
  );
});

module.exports = { chatbotRouter: router };
