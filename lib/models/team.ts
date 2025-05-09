import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  code: { type: String, unique: true },
  members: [{
    userId: String,
    email: String,
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate a unique team code before saving
teamSchema.pre('save', async function(next) {
  if (!this.code) {
    this.code = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);