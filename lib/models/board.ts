import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  totalTasks: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  members: [{
    id: String,
    name: String,
    avatar: String,
    initials: String
  }],
  lastUpdated: { type: Date, default: Date.now },
  isStarred: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Board = mongoose.models.Board || mongoose.model('Board', boardSchema);