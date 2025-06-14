const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { getCurrentUser } = require("./auth");
const { CRISIS_WORDS, DETECT_MOOD } = require("./moodCrisisData");
const { getSystemPrompt } = require("./systemPrompt");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const fetch = global.fetch; 

const getChatResponse = async (userMessage, conversationId) => {
  // Specify the model in the payload
  const url = process.env.MODEL_API_URL || "http://localhost:11434/api/generate";
  const availableModels = ["llama3.2:3b", "deepseek-r1:8b"];
  const selectedModel = process.env.SELECTED_MODEL || "llama3.2:3b";
  
  if (!availableModels.includes(selectedModel)) {
    throw new Error(`Invalid model selected. Available models are: ${availableModels.join(", ")}`);
  }

  // Get conversation history if conversationId exists
  let conversationHistory = "";
  if (conversationId) {
    // Get the last 10 messages for context to keep it manageable
    const messages = await Message.find({ conversation_id: conversationId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
    
    // Reverse the messages to maintain chronological order
    messages.reverse();
    
    // Format the conversation history
    conversationHistory = messages.map(msg => 
      `User: ${msg.user_message}\nAssistant: ${msg.bot_response}`
    ).join("\n\n");
  }

  const payload = {
    model: selectedModel,
    prompt: getSystemPrompt(userMessage, conversationHistory),
    stream: false
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    console.log("Raw response from model endpoint:", text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse JSON. Raw response:", text);
      throw new Error("Failed to parse JSON from model response");
    }
    if (!response.ok) {
      console.error("Ollama responded with error:", data);
      throw new Error(data.error?.message || "Ollama API error");
    }
    return data.response ? data.response.trim() : data.result.trim();
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

const createNewConversation = async (userId, conversationId) => {
  const conversation = new Conversation({ _id: conversationId, user_id: userId });
  await conversation.save();
};

const storeChat = async (userId, conversationId, userMessage, botResponse, mood, isCrisis) => {
  const messageId = uuidv4();
  const message = new Message({
    _id: messageId,
    user_id: userId,
    conversation_id: conversationId,
    user_message: userMessage,
    bot_response: botResponse,
    mood,
    is_crisis: isCrisis,
  });
  await message.save();
};

router.post("/", getCurrentUser, async (req, res) => {
  const { user } = req;
  let { user_message, conversation_id } = req.body;
  const isCrisis = CRISIS_WORDS.some(word => user_message.toLowerCase().includes(word));
  const mood = detectMood(user_message);

  try {
    if (!conversation_id) {
      conversation_id = uuidv4();
      await createNewConversation(user.id, conversation_id);
    }
    let responseText;
    if (isCrisis)
      responseText = "Please seek professional help. You're not alone ❤️.";
    else {
      try {
        responseText = await getChatResponse(user_message, conversation_id);
      } catch (err) {
        return res.status(500).json({ detail: err.message });
      }
    }
    await storeChat(user.id, conversation_id, user_message, responseText, mood, isCrisis);
    res.json({ response: responseText, conversation_id, mood });
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
});

// GET /chat/history
router.get("/history", getCurrentUser, async (req, res) => {
  const { user } = req;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const messages = await Message.find({ user_id: user.id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    // Group messages by conversation_id
    const conversations = {};
    messages.forEach((row) => {
      if (!conversations[row.conversation_id])
        conversations[row.conversation_id] = { id: row.conversation_id, messages: [], timestamp: row.timestamp };
      conversations[row.conversation_id].messages.push({
        id: row._id,
        user_message: row.user_message,
        bot_response: row.bot_response,
        mood: row.mood,
        is_crisis: row.is_crisis,
        timestamp: row.timestamp
      });
    });
    res.json({ history: Object.values(conversations) });
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
});

// DELETE /chat/:conversationId
router.delete("/:conversationId", getCurrentUser, async (req, res) => {
  const { user } = req;
  const { conversationId } = req.params;

  try {
    // Delete all messages associated with the conversation
    await Message.deleteMany({ 
      user_id: user.id,
      conversation_id: conversationId 
    });

    // Delete the conversation itself
    await Conversation.deleteOne({ 
      _id: conversationId,
      user_id: user.id 
    });

    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = { chatbotRouter: router };
