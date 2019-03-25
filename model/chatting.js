const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  participants: { type: [{
                  nickname: { type: String, required: true, },
                }], default: [],
  },
});

const messageSchema = new Schema({
  conversation_id: { type: Schema.Types.ObjectId, required: true, },
  sender: { type: String, required: true, },
  content: { type: String, required: true, },
  created_at: { type: Date, default: Date.now(), },
});

module.exports = {
  conversation: mongoose.model('conversation', conversationSchema),
  message: mongoose.model('message', messageSchema),
};