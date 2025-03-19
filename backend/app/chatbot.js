const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { getCurrentUser } = require("./auth");
const { CRISIS_WORDS, DETECT_MOOD } = require("./moodCrisisData");
const db = require("./database");

const getChatResponse = async (userMessage) => {
    let convo = "";  
    const url = "http://localhost:3000/api/generate";
    const payload = {
      model: "deepseek-r1:8b",
      prompt: userMessage
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Model API error: ${errorText}`);
      }
  
      // Read the response as text
      const text = await response.text();
  
      // Split the text into individual JSON strings based on newlines
      const lines = text.split("\n").filter(line => line.trim() !== "");
  
      // Parse each line as JSON
      lines.map(line => {
        try {
            const ob = JSON.parse(line);
            convo += ob.response
        } catch (err) {
          console.error("Error parsing line:", line);
          return null;
        }
      }).filter(response => response !== null); // Filter out any null responses
  
  
      return convo.trim();
    } catch (err) {
      console.error("Error in getChatResponse:", err);
      throw err;
    }
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
router.post("/", getCurrentUser, async (req, res) => {
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

  async function processChat() {
    let responseText;
    if (isCrisis)
      responseText = "Please seek professional help. You're not alone ❤️.";
    else {
      // Build conversation context to include previous interactions
      const buildPrompt = () => {
        return new Promise((resolve, reject) => {
          db.all(
            "SELECT user_message, bot_response FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC",
            [conversation_id],
            (err, rows) => {
              if (err) return reject(err);
              let context = "";
              rows.forEach(row => {
                context += `User: ${row.user_message}\nBot: ${row.bot_response}\n`;
              });
              resolve(context + "User: " + user_message);
            }
          );
        });
      };

      let promptWithContext;
      try {
        promptWithContext = await buildPrompt();
      } catch (err) {
        promptWithContext = user_message;
      }
      responseText = await getChatResponse(promptWithContext);
    }
    
    console.log(responseText);
      
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
