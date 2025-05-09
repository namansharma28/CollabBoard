import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    id: String,
    name: String,
    avatar: String,
    initials: String
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  channel: { type: String, required: true }
});

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);