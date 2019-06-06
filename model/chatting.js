const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  nickname: { type: String, required: true },
  conversations: { type: [Schema.Types.ObjectId], default: [] },
});

const conversationSchema = new Schema({
  participants: { type: [{
      nickname: { type: String, required: true, },
      title: { type: String, required: true, },
      goalId: { type: String , required: true, },
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
  user: mongoose.model('user', userSchema),
  conversation: mongoose.model('conversation', conversationSchema),
  message: mongoose.model('message', messageSchema),
};