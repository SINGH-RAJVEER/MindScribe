const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // id as string
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation_id: { type: String, ref: 'Conversation', required: true },
  user_message: String,
  bot_response: String,
  mood: String,
  is_crisis: Boolean,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema); 