const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // id as string
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Conversation', conversationSchema); 